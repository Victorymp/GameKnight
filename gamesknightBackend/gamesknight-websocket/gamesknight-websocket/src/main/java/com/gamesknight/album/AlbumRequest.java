package com.gamesknight.album;

import java.util.List;
import com.gamesknight.image.ImageRequest;

public class AlbumRequest {
    private String title;
    private String description;
    private String tags;
    private Boolean isPublic;
    private List<ImageRequest> images;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public Boolean getIsPublic() { return isPublic; }
    public void setIsPublic(Boolean isPublic) { this.isPublic = isPublic; }
    public List<ImageRequest> getImages() { return images; }
    public void setImages(List<ImageRequest> images) { this.images = images; }
}