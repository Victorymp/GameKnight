package com.example.gamesknight.game;

import java.util.List;

public class QuestionRequest {
    private String text;
    private String imageData;
    private List<AnswerRequest> answers;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getImageData() { return imageData; }
    public void setImageData(String imageData) { this.imageData = imageData; }

    public List<AnswerRequest> getAnswers() { return answers; }
    public void setAnswers(List<AnswerRequest> answers) { this.answers = answers; }
}