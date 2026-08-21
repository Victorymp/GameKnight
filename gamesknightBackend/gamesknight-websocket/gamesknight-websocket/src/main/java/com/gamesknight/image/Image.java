package com.gamesknight.image;

public class Image {
	
	private boolean isThumbnails;
	private boolean isPrimary;
	private String title;
	private String content;
	
	public Image() {
		
	}
	
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
	  
}
