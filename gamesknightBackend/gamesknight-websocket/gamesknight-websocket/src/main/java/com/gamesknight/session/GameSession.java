package com.gamesknight.session;

import com.gamesknight.game.Game;
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
    private final Map<String, String> players = new LinkedHashMap<>();
    // questionId -> (answerId -> count)
    private final Map<Long, Map<Long, Integer>> counts = new HashMap<>();
    // questionId -> set of playerIds who have voted
    private final Map<Long, Set<String>> voters = new HashMap<>();

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
    public Map<String, String> getPlayers() { return players; }

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
        players.put(playerId, name);
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

    public boolean allPlayersVoted() {
        if (players.isEmpty()) return false;
        return currentVoterCount() >= players.size();
    }

    public long phaseElapsedMs() {
        return System.currentTimeMillis() - phaseStartMs;
    }
}