package com.gamesknight.image;

import java.nio.charset.StandardCharsets;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.gamesknight.album.Album;
import com.gamesknight.game.Game;
import com.gamesknight.question.Question;
import com.gamesknight.storage.GameKnightStorage;

import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Transient;

@Entity
public class Image {
	
	@Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
	private boolean isThumbnails;
	private boolean isPrimary;
	private String title;
	private String type;
	private String path;
	private String category;	
	private String blobName;

	@Transient
	private String content;
	
	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "game_id", nullable = true)
	@JsonBackReference("game-images")
	private Game game;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "question_id", nullable = true)
	@JsonBackReference("question-images")
	private Question question;

	@ManyToOne(fetch = FetchType.LAZY)
	@JoinColumn(name = "album_id", nullable = true)
	@JsonBackReference("album-images")
	private Album album;

	public Image() {
		
	}
	
	public Image(byte[] imageByte) {
		this.content = new String(imageByte, StandardCharsets.UTF_8);
	}
	
	public Image(String blobName, String base64Data, String type) {
		this.path = blobName;
		this.content = base64Data;
		this.type = type;
	}
	
	public Image(ImageRequest request) {
		initalize(request);
	}
	
	public Image(ImageRequest request, Question question) {
		initalize(request);
	    this.question = question;
	}
	
	public Image(ImageRequest request, Game game) {
		initalize(request);
	    this.game = game;
	}
	
	public Image(ImageRequest request, Album album) {
		initalize(request);
	    this.album = album;
	}
	
	public void initalize(ImageRequest request) {
		this.isThumbnails = request.isThumbnails();
	    this.isPrimary = request.isPrimary();
	    this.title = request.getTitle();
	    this.content = request.getContent();
	    this.type = request.getType();
	    this.path = request.getPath();
	    this.category = request.getCategory();
	    this.blobName = new GameKnightStorage().generateBlobName(request.getType());
	}
	
	public Game getGame() {
		return game;
	}
	
	public void setId(Long id) {
		this.id = id;
	}
	
	public Long getId() {
		return this.id;
	}
	
	public void setGame(Game game) {
		this.game = game;
	}
	public Question getQuestion() {
		return question;
	}

	public void setQuestion(Question question) {
		this.question = question;
	}
	
	public Album getAlbum() { return album; }
	public void setAlbum(Album album) { this.album = album; }

	public boolean isThumbnails() {
		return isThumbnails;
	}
	public void setThumbnails(boolean isThumbnails) {
		this.isThumbnails = isThumbnails;
	}
	public boolean isPrimary() {
		return isPrimary;
	}
	public void setPrimary(boolean isPrimary) {
		this.isPrimary = isPrimary;
	}
	public String getTitle() {
		return title;
	}
	public void setTitle(String title) {
		this.title = title;
	}
	public String getContent() {
		return content;
	}
	public void setContent(String content) {
		this.content = content;
	}
	
	public void setConent(byte[] imageBytes) {
		this.content = new String(imageBytes, StandardCharsets.UTF_8);
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public String getPath() {
		return path;
	}

	public void setPath(String path) {
		this.path = path;
	}	
	
	public String getCategory() { 
		return category; 
	}
	public void setCategory(String category) { 
		this.category = category; 
	}

	public String getBlobName() {
		return blobName;
	}

	public void setBlobName(String blobName) {
		this.blobName = blobName;
	}	  
}
