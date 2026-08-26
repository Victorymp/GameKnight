package com.gamesknight.session;

import com.gamesknight.game.Game;
import com.gamesknight.player.Player;
import com.gamesknight.question.Question;

import java.util.*;
import java.util.concurrent.locks.ReentrantLock;

public class GameSession {
    public static final long QUESTION_DURATION_MS = 30_000L;
    public static final long REVEAL_DURATION_MS = 5_000L;
    public static final long GET_READY_DURATION_MS = 5_000L;
    
    private final String gameCode;
    private final Game game;
    private final ReentrantLock lock = new ReentrantLock();

    private GamePhase phase = GamePhase.LOBBY;
    private int currentQuestionIndex = -1;
    private long phaseStartMs = 0L;

    // playerId -> displayName
//    private final Map<String, String> players = new LinkedHashMap<>();
    // questionId -> (answerId -> count)
    private final Map<Long, Map<Long, Integer>> counts = new HashMap<>();
    // questionId -> set of playerIds who have voted
    private final Map<Long, Set<String>> voters = new HashMap<>();
    
    private final Map<String, Integer> scores = new HashMap<>();
    
    private final Map<String, Player> players = new HashMap<>();

    public GameSession(Game game) {
        this.gameCode = game.getGameCode();
        this.game = game;
    }

    public ReentrantLock lock() { return lock; }
    public String getGameCode() { return gameCode; }
    public Game getGame() { return game; }
    public GamePhase getPhase() { return phase; }
    public int getCurrentQuestionIndex() { return currentQuestionIndex; }
    public long getPhaseStartMs() { return phaseStartMs; }
    public Map<String, Player> getPlayers() { return players; }

    public Question getCurrentQuestion() {
        List<Question> qs = game.getQuestions();
        if (currentQuestionIndex < 0 || currentQuestionIndex >= qs.size()) return null;
        return qs.get(currentQuestionIndex);
    }

    public Map<Long, Integer> currentCounts() {
        Question q = getCurrentQuestion();
        if (q == null) return Map.of();
        return counts.getOrDefault(q.getId(), Map.of());
    }

    public int currentVoterCount() {
        Question q = getCurrentQuestion();
        if (q == null) return 0;
        return voters.getOrDefault(q.getId(), Set.of()).size();
    }

    public void addPlayer(String playerId, String name) {
        players.put(playerId, new Player(playerId, name));
    }
    
    public void addScore(String playerId, int points) {
        Player player = players.get(playerId);

        if (player != null) {
            player.addScore(points);
        }
    }
    
    public List<Player> getLeaderbord() {
    	List<Player> leaderboard = players.values()
    	        .stream()
    	        .sorted(Comparator.comparingInt(Player::getScore).reversed())
    	        .toList();
    	
    	for (int i = 0; i < leaderboard.size(); i++) {
    	    leaderboard.get(i).setRank(i + 1);
    	}
    	
    	return leaderboard;
    }
    
    public int getScore(String playerId) {
        return scores.getOrDefault(playerId, 0);
    }

    public void enterPhase(GamePhase newPhase, int questionIndex) {
        this.phase = newPhase;
        this.currentQuestionIndex = questionIndex;
        this.phaseStartMs = System.currentTimeMillis();
    }

    public boolean recordVote(String playerId, long questionId, long answerId) {
        Set<String> alreadyVoted = voters.computeIfAbsent(questionId, k -> new HashSet<>());
        if (!alreadyVoted.add(playerId)) return false; // double-vote ignored
        Map<Long, Integer> byAnswer = counts.computeIfAbsent(questionId, k -> new HashMap<>());
        byAnswer.merge(answerId, 1, Integer::sum);
        return true;
    }
    
    public int calculateScore(int baseScore, long elapsedMs, long questionTimeMs) {

        double multiplier = 1.0 - ((double) elapsedMs / questionTimeMs);

        // Keep multiplier between 0 and 1
        multiplier = Math.max(0.0, Math.min(1.0, multiplier));

        return (int) Math.round(baseScore * multiplier);
    }

    public boolean allPlayersVoted() {
        if (players.isEmpty()) return false;
        return currentVoterCount() >= players.size();
    }

    public long phaseElapsedMs() {
        return System.currentTimeMillis() - phaseStartMs;
    }
}