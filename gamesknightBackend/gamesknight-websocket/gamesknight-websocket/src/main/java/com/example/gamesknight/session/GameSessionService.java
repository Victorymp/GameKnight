package com.example.gamesknight.session;

import com.example.gamesknight.game.Game;
import com.example.gamesknight.game.GameRepository;
import com.example.gamesknight.question.Question;
import com.example.gamesknight.question.QuestionRepository;
import com.example.gamesknight.answer.Answer;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class GameSessionService {
    private static final Logger log = LoggerFactory.getLogger(GameSessionService.class);

    private final Map<String, GameSession> sessions = new ConcurrentHashMap<>();
    private final GameRepository gameRepository;
    private final SimpMessagingTemplate broker;

    private final QuestionRepository questionRepository;

    public GameSessionService(GameRepository gameRepository, QuestionRepository questionRepository,  SimpMessagingTemplate broker) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.broker = broker;
    }

    @Transactional(readOnly = true)
    public GameSession getOrCreate(String gameCode) {
        return sessions.computeIfAbsent(gameCode, code -> {
            Game g = gameRepository.findByGameCodeWithQuestions(code)
                    .orElseThrow(() -> new IllegalStateException("Unknown game: " + code));
            
            // Hydrates answers on the same managed Question instances above
            questionRepository.findByGameCodeWithAnswers(code);
            
            return new GameSession(g);
        });
    }

    public void playerJoin(String gameCode, String playerId, String name) {
        GameSession s = getOrCreate(gameCode);
        s.lock().lock();
        try {
            s.addPlayer(playerId, name);
            broadcast(gameCode, "player:list", Map.of("players", playerListPayload(s)));
        } finally { s.lock().unlock(); }
    }

    public void startGame(String gameCode) {
        GameSession s = getOrCreate(gameCode);
        s.lock().lock();
        try {
            if (s.getPhase() != GamePhase.LOBBY) return;
            advanceToQuestion(s, 0);
        } finally { s.lock().unlock(); }
    }

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
                    case QUESTION -> {
                        if (s.phaseElapsedMs() >= GameSession.QUESTION_DURATION_MS) {
                            enterReveal(s);
                        }
                    }
                    case REVEAL -> {
                        if (s.phaseElapsedMs() >= GameSession.REVEAL_DURATION_MS) {
                            int next = s.getCurrentQuestionIndex() + 1;
                            if (next >= s.getGame().getQuestions().size()) {
                                enterEnded(s);
                            } else {
                                advanceToQuestion(s, next);
                            }
                        }
                    }
                    default -> { /* no-op */ }
                }
            } catch (Exception e) {
                log.error("Tick error for game {}", s.getGameCode(), e);
            } finally { s.lock().unlock(); }
        }
    }

    private void advanceToQuestion(GameSession s, int index) {
        s.enterPhase(GamePhase.QUESTION, index);
        Question q = s.getCurrentQuestion();
        if (q == null) { enterEnded(s); return; }

        Map<String, Object> questionView = Map.of(
                "id", q.getId(),
                "text", q.getText(),
                "imageData", q.getImageData(),
                "answers", q.getAnswers().stream()
                        .map(a -> Map.of("id", a.getId(), "text", a.getText()))
                        .toList()
        );

        broadcast(s.getGameCode(), "question:show", Map.of(
                "questionIndex", index,
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

        broadcast(s.getGameCode(), "question:reveal", Map.of(
                "questionId", q.getId(),
                "correctAnswerId", correctId,
                "counts", s.currentCounts(),
                "phaseDurationMs", GameSession.REVEAL_DURATION_MS
        ));
    }

    private void enterEnded(GameSession s) {
        s.enterPhase(GamePhase.ENDED, s.getCurrentQuestionIndex());
        broadcast(s.getGameCode(), "game:end", Map.of());
    }

    private List<Map<String, String>> playerListPayload(GameSession s) {
        return s.getPlayers().entrySet().stream()
                .map(e -> Map.of("id", e.getKey(), "name", e.getValue()))
                .toList();
    }

    private void broadcast(String gameCode, String type, Object payload) {
        broker.convertAndSend(
            "/topic/game/" + gameCode,
            (Object) Map.of("type", type, "payload", payload)
        );
    }
}