package com.example.gamesknight.question;

import java.util.List;

import com.example.gamesknight.answer.AnswerRequest;

public class QuestionRequest {
    private String text;
    private String imagePreview;
    private List<AnswerRequest> answers;

    public String getText() { return text; }
    public void setText(String text) { this.text = text; }

    public String getImagePreview() { return imagePreview; }
    public void setImagePreview(String imagePreview) { this.imagePreview = imagePreview; }

    public List<AnswerRequest> getAnswers() { return answers; }
    public void setAnswers(List<AnswerRequest> answers) { this.answers = answers; }
	public String getImageData() { return this.imagePreview; }
}