package com.gamesknight.question;

import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gamesknight.answer.Answer;
import com.gamesknight.game.Game;
import com.gamesknight.image.Image;
import com.gamesknight.storage.GameKnightStorage;
import io.github.cdimascio.dotenv.Dotenv;

@Entity
@Table(name = "questions")
public class Question {
	private static final Dotenv env = Dotenv.configure()
    	    .ignoreIfMissing()
    	    .load();
	private static final String IMAGE_CONTAINER = env.get("AZURE_STORAGE_IMAGE_CONTAINER");
	private static final Logger logger = LoggerFactory.getLogger(Question.class);

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 1000)
    private String text;

    // Base64 data URL or image reference — adjust to a URL/path
    // if images end up stored via file storage instead of inline

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "game_id", nullable = false)
    @JsonBackReference
    private Game game;

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Answer> answers = new ArrayList<>();
    
    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Image> images = new ArrayList<>();

    protected Question() {
        // JPA requires a no-arg constructor
    }

    public Question(String text, Game game) {
        this.text = text;
        this.game = game;
    }
    
    public Question createQuestion() {
    	return this;
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
    
    public void setImages() {
    	if (images.size() > 0) images = new GameKnightStorage().setImage(images);
    }
    
    public void setImages(List<Image> imageImport) {
    	if (imageImport.size() > 0) this.images = new GameKnightStorage().setImage(imageImport);
    }
    
    public List<Image> getImages() {
    	return this.images;
    }
    
    public void addImage(Image image) {
    	images.add(image);
    	image.setQuestion(this);
    }
    
    public void removeImage(Image image) {
    	images.remove(image);
    	image.setQuestion(null);
    }
    
}