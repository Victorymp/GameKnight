package com.gamesknight.game;

import java.util.List;

import com.gamesknight.image.ImageRequest;
import com.gamesknight.question.QuestionRequest;

public class GameRequest {
    private String gameCode;
    private List<QuestionRequest> questions;
    private List<ImageRequest> images;

    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }

    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
    
    public List<ImageRequest> getImages() { return images; }
    public void setImages(List<ImageRequest> images) { this.images = images; }
}