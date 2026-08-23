package com.gamesknight.image;

public class ImageRequest {

    private boolean thumbnails;
    private boolean primary;
    private String title;
    private String content;
    private String type;
    private String path;

    public boolean isThumbnails() {
        return thumbnails;
    }

    public void setThumbnails(boolean thumbnails) {
        this.thumbnails = thumbnails;
    }

    public boolean isPrimary() {
        return primary;
    }

    public void setPrimary(boolean primary) {
        this.primary = primary;
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
}