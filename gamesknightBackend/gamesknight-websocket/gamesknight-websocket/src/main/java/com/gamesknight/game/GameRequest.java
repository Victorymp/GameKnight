package com.example.gamesknight.game;

import java.util.List;

import com.example.gamesknight.question.QuestionRequest;

public class GameRequest {
    private String gameCode;
    private List<QuestionRequest> questions;

    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
}