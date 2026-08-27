package com.gamesknight.session;

import com.gamesknight.answer.Answer;
import com.gamesknight.game.Game;
import com.gamesknight.game.GameRepository;
import com.gamesknight.image.Image;
import com.gamesknight.image.ImageService;
import com.gamesknight.player.Player;
import com.gamesknight.question.Question;
import com.gamesknight.question.QuestionRepository;
import com.gamesknight.storage.GameKnightStorage;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

import io.github.cdimascio.dotenv.Dotenv;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

@Service
public class GameSessionService {
    private static final Logger log = LoggerFactory.getLogger(GameSessionService.class);

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    
    private final Cache<String, String> imageCache = Caffeine.newBuilder()
    	    .maximumSize(200)          // cap at 200 images
    	    .expireAfterAccess(1, TimeUnit.HOURS)  // drop unused ones
    	    .build();
    
    private final ImageService imageService;
    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final SimpMessagingTemplate broker;

    public GameSessionService(
            GameRepository gameRepository,
            QuestionRepository questionRepository,
            SimpMessagingTemplate broker,
            ImageService imageService
    ) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.broker = broker;
        this.imageService = imageService;
    }

    @Transactional(readOnly = true)
    public GameSession getOrCreate(String gameCode) {
        return sessions.computeIfAbsent(gameCode, code -> {
            Game g = gameRepository.findByGameCodeWithQuestions(code)
                    .orElseThrow(() -> new IllegalStateException("Unknown game: " + code));

            // Force answer hydration
            questionRepository.findByGameCodeWithAnswers(code);

            // Force initialization of each answer collection so it survives the closed session
            for (Question q : g.getQuestions()) {
                org.hibernate.Hibernate.initialize(q.getAnswers());
                org.hibernate.Hibernate.initialize(q.getImages());
            }

            return new GameSession(g);
        });
    }
    @Transactional
    public void playerJoin(String gameCode, String playerId, String name) {
        GameSession s = getOrCreate(gameCode);
        s.lock().lock();
        try {
            s.addPlayer(playerId, name);
            broadcast(gameCode, "player:list", Map.of("players", playerListPayload(s)));
        } finally { s.lock().unlock(); }
    }
    @Transactional
    public void startGame(String gameCode) {
        GameSession s = getOrCreate(gameCode);
        s.lock().lock();
        try {
            if (s.getPhase() != GamePhase.LOBBY) return;
            advanceToQuestion(s, 0);
        } finally { s.lock().unlock(); }
    }
    @Transactional
    public void submitVote(String gameCode, String playerId, long questionId, long answerId) {
        GameSession s = sessions.get(gameCode);
        if (s == null) return;
        s.lock().lock();
        try {
            if (s.getPhase() != GamePhase.QUESTION) return;
            Question q = s.getCurrentQuestion();
            if (q == null || q.getId() != questionId) return;

            boolean accepted = s.recordVote(playerId, questionId, answerId);
            if (!accepted) return;

            // Score if correct — scale points by remaining time (Kahoot-style)
            Answer chosen = q.getAnswers().stream()
                    .filter(a -> a.getId() == answerId)
                    .findFirst()
                    .orElse(null);

            if (chosen != null && chosen.isCorrect()) {
                long remaining = Math.max(0, GameSession.QUESTION_DURATION_MS - s.phaseElapsedMs());
                int points = 500 + (int)((remaining * 500) / GameSession.QUESTION_DURATION_MS);
                Player p = s.getPlayers().get(playerId);
                if (p != null) p.addScore(points);
            }

            broadcast(gameCode, "vote:update", Map.of(
                    "questionId", questionId,
                    "counts", s.currentCounts(),
                    "voterCount", s.currentVoterCount(),
                    "playerCount", s.getPlayers().size()
            ));

            if (s.allPlayersVoted()) {
                enterReveal(s);
            }
        } finally { s.lock().unlock(); }
    }
    /** Called by GameScheduler on every tick. Handles phase timeouts. */
    public void tick() {
        for (GameSession s : sessions.values()) {
            if (!s.lock().tryLock()) continue;
            try {
                switch (s.getPhase()) {
                    case GET_READY -> {
                        if (s.phaseElapsedMs() >= GameSession.GET_READY_DURATION_MS) {
                            activateQuestion(s);
                        }
                    }
                    case QUESTION -> {
                        if (s.phaseElapsedMs() >= GameSession.QUESTION_DURATION_MS) {
                            enterReveal(s);
                        }
                    }
                    case REVEAL -> {
//                        if (s.phaseElapsedMs() >= GameSession.REVEAL_DURATION_MS) {
//                            int next = s.getCurrentQuestionIndex() + 1;
//                            if (next >= s.getGame().getQuestions().size()) {
//                                enterEnded(s);
//                            } else {
//                                advanceToQuestion(s, next);
//                            }
//                        }
                    	if (s.phaseElapsedMs() >= GameSession.REVEAL_DURATION_MS) {
                            enterScore(s);
                        }
                    }
                    case SCORE -> {
                        if (s.phaseElapsedMs() >= GameSession.SCORE_DURATION_MS) {
                            int next = s.getCurrentQuestionIndex() + 1;
                            if (next >= s.getGame().getQuestions().size()) {
                                enterEnded(s);
                            } else {
                                advanceToQuestion(s, next);
                            }
                        }
                    }
                    default -> {}
                }
            } catch (Exception e) {
                log.error("Tick error for game {}", s.getGameCode(), e);
            } finally { s.lock().unlock(); }
        }
    }

    private void advanceToQuestion(GameSession s, int index) {
        Question q = s.getGame().getQuestions().get(index);
        if (q == null) { enterEnded(s); return; }

        s.enterPhase(GamePhase.GET_READY, index);

        // Small "get ready" payload — text + hasImage, no answers yet
        Map<String, Object> questionPreview = new HashMap<>();
        questionPreview.put("id", q.getId());
        questionPreview.put("text", q.getText());
        questionPreview.put("hasImage", q.getImages() != null && !q.getImages().isEmpty());

        broadcast(s.getGameCode(), "question:preload", Map.of(
            "questionIndex", index,
            "totalQuestions", s.getGame().getQuestions().size(),
            "phaseDurationMs", GameSession.GET_READY_DURATION_MS,
            "question", questionPreview
        ));
    }

    private void activateQuestion(GameSession s) {
        s.enterPhase(GamePhase.QUESTION, s.getCurrentQuestionIndex());
        Question q = s.getCurrentQuestion();

        Map<String, Object> questionView = new HashMap<>();
        questionView.put("id", q.getId());
        questionView.put("text", q.getText());
        questionView.put("hasImage", q.getImages() != null && !q.getImages().isEmpty());
        questionView.put("answers", q.getAnswers().stream()
            .map(a -> {
                Map<String, Object> answerMap = new HashMap<>();
                answerMap.put("id", a.getId());
                answerMap.put("text", a.getText());
                return answerMap;
            })
            .toList());

        broadcast(s.getGameCode(), "question:show", Map.of(
            "questionIndex", s.getCurrentQuestionIndex(),
            "totalQuestions", s.getGame().getQuestions().size(),
            "phaseDurationMs", GameSession.QUESTION_DURATION_MS,
            "question", questionView
        ));
    }

    private void enterReveal(GameSession s) {
        s.enterPhase(GamePhase.REVEAL, s.getCurrentQuestionIndex());
        Question q = s.getCurrentQuestion();
        Long correctId = q.getAnswers().stream()
                .filter(Answer::isCorrect)
                .map(Answer::getId)
                .findFirst()
                .orElse(null);

        // Recompute ranks
        updateRanks(s);

        broadcast(s.getGameCode(), "question:reveal", Map.of(
                "questionId", q.getId(),
                "correctAnswerId", correctId,
                "counts", s.currentCounts(),
                "phaseDurationMs", GameSession.REVEAL_DURATION_MS,
                "players", playerListPayload(s)   // include updated scores/ranks
        ));
    }

    private void updateRanks(GameSession s) {
        List<Player> sorted = s.getPlayers().values().stream()
                .sorted(Comparator.comparingInt(Player::getScore).reversed())
                .toList();

        int rank = 0;
        int lastScore = -1;
        int ties = 0;
        for (Player p : sorted) {
            if (p.getScore() == lastScore) {
                ties++;
            } else {
                rank += 1 + ties;
                ties = 0;
                lastScore = p.getScore();
            }
            p.setRank(rank);
        }
    }

    private void enterEnded(GameSession s) {
        s.enterPhase(GamePhase.ENDED, s.getCurrentQuestionIndex());
        broadcast(s.getGameCode(), "game:end", Map.of());
    }

    private List<Map<String, Object>> playerListPayload(GameSession s) {
        return s.getPlayers().values().stream()
                .map(p -> {
                    Map<String, Object> m = new HashMap<>();
                    m.put("id", p.getId());
                    m.put("name", p.getName());
                    m.put("score", p.getScore());
                    m.put("rank", p.getRank());
                    return m;
                })
                .toList();
    }

    private void broadcast(String gameCode, String type, Object payload) {
        broker.convertAndSend(
            "/topic/game/" + gameCode,
            (Object) Map.of("type", type, "payload", payload)
        );
    }
    
    private List<Map<String, Object>> leaderboardPayload(GameSession s) {

        List<Map<String, Object>> leaderboard = s.getPlayers().entrySet().stream()
                .map(entry -> {
                    String playerId = entry.getKey();

                    return Map.<String, Object>of(
                            "id", playerId,
                            "name", entry.getValue(),
                            "score", s.getScore(playerId)
                    );
                })
                .sorted(Comparator.comparingInt(
                        (Map<String, Object> player) ->
                                (Integer) player.get("score")
                ).reversed())
                .toList();

        List<Map<String, Object>> result = new ArrayList<>();

        for (int i = 0; i < leaderboard.size(); i++) {
            Map<String, Object> player = new HashMap<>(leaderboard.get(i));
            player.put("rank", i + 1);
            result.add(player);
        }

        return result;
    }
    
    private void enterScore(GameSession s) {
        s.enterPhase(GamePhase.SCORE, s.getCurrentQuestionIndex());

        int next = s.getCurrentQuestionIndex() + 1;
        boolean isLast = next >= s.getGame().getQuestions().size();

        broadcast(s.getGameCode(), "score:show", Map.of(
                "questionIndex", s.getCurrentQuestionIndex(),
                "totalQuestions", s.getGame().getQuestions().size(),
                "phaseDurationMs", GameSession.SCORE_DURATION_MS,
                "isFinalQuestion", isLast,
                "players", playerListPayload(s)
        ));
    }
    
    public void resetGame(String gameCode) {
        GameSession existing = sessions.remove(gameCode);
        if (existing != null) {
            log.info("Reset game {}: removed session with {} players in phase {}",
                    gameCode, existing.getPlayers().size(), existing.getPhase());
        }
        // Broadcast reset so any connected clients wipe their local state
        broadcast(gameCode, "game:reset", Map.of("gameCode", gameCode));
    }
}