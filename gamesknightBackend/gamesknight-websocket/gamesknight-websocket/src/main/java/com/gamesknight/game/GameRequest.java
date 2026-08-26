package com.gamesknight.game;

import java.util.List;

import com.gamesknight.image.ImageRequest;
import com.gamesknight.question.QuestionRequest;

public class GameRequest {
    private String gameCode;
    private String gameTitle;
    private String gameDescription;
    private List<QuestionRequest> questions;
    private List<ImageRequest> images;

    public String getGameCode() { return gameCode; }
    public void setGameCode(String gameCode) { this.gameCode = gameCode; }
    
    public String getGameTitle() { return gameTitle; }
    public void setGameTitle(String gameTitle) {this.gameTitle = gameTitle;}

    public List<QuestionRequest> getQuestions() { return questions; }
    public void setQuestions(List<QuestionRequest> questions) { this.questions = questions; }
    
    public List<ImageRequest> getImages() { return images; }
    public void setImages(List<ImageRequest> images) { this.images = images; }
    
    public String getGameDescription() {
		return gameDescription;
	}

	public void setGameDescription(String gameDescription) {
		this.gameDescription = gameDescription;
	}

}