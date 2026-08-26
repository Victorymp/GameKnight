package com.gamesknight.album;

import java.util.ArrayList;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gamesknight.game.Game;
import com.gamesknight.image.Image;

import jakarta.persistence.*;

@Entity
@Table(name = "albums")
public class Album {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 1000)
    private String description;

    @Column(length = 500)
    private String tags; // comma-separated for now

    @Column(nullable = false)
    private boolean isPublic = true;

    @Column(nullable = true)
    private String ownerId; // populated when auth is added

    @OneToMany(mappedBy = "album", cascade = CascadeType.PERSIST, orphanRemoval = false)
    @JsonManagedReference("album-games")
    private List<Game> games = new ArrayList<>();

    @OneToMany(mappedBy = "album", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference("album-images")
    private List<Image> images = new ArrayList<>();

    protected Album() {}

    public Album(String title) {
        this.title = title;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }
    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }
    public String getOwnerId() { return ownerId; }
    public void setOwnerId(String ownerId) { this.ownerId = ownerId; }
    public List<Game> getGames() { return games; }
    public List<Image> getImages() { return images; }

    public void addGame(Game game) {
        games.add(game);
        game.setAlbum(this);
    }

    public void removeGame(Game game) {
        games.remove(game);
        game.setAlbum(null);
    }
}