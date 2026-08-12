package com.example.gamesknight.game;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "questions")
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String text;

    // Base64 data URL or image reference — adjust to a URL/path
    // if images end up stored via file storage instead of inline
    @Lob
    @Column(name = "image_data")
    private String imageData;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    private Game game;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Answer> answers = new ArrayList<>();

    protected Question() {
        // JPA requires a no-arg constructor
    }

    public Question(String text, Game game) {
        this.text = text;
        this.game = game;
    }

    public Long getId() {
        return id;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public String getImageData() {
        return imageData;
    }

    public void setImageData(String imageData) {
        this.imageData = imageData;
    }

    public Game getGame() {
        return game;
    }

    public void setGame(Game game) {
        this.game = game;
    }

    public List<Answer> getAnswers() {
        return answers;
    }

    public void addAnswer(Answer answer) {
        answers.add(answer);
        answer.setQuestion(this);
    }

    public void removeAnswer(Answer answer) {
        answers.remove(answer);
        answer.setQuestion(null);
    }
}