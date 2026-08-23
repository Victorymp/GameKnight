package com.gamesknight.question;

import java.util.List;

import com.gamesknight.answer.AnswerRequest;
import com.gamesknight.image.ImageRequest;

public class QuestionRequest {
    private String text;
    private List<AnswerRequest> answers;
    private List<ImageRequest> images;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }


    public List<AnswerRequest> getAnswers() { return answers; }
    public void setAnswers(List<AnswerRequest> answers) { this.answers = answers; }
	
	public List<ImageRequest> getImages() { return images; }
    public void setImages(List<ImageRequest> images) { this.images = images; }
}