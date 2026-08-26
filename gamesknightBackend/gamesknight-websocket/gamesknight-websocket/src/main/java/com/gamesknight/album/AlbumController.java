package com.gamesknight.album;

import java.util.ArrayList;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gamesknight.game.Game;
import com.gamesknight.game.GameRepository;
import com.gamesknight.image.Image;
import com.gamesknight.image.ImageRequest;
import com.gamesknight.image.ImageService;
import com.gamesknight.storage.GameKnightStorage;

@RestController
@RequestMapping("/albums")
public class AlbumController {
    private static final Logger log = LoggerFactory.getLogger(AlbumController.class);

    private final AlbumRepository albumRepository;
    private final GameRepository gameRepository;
    private final ImageService imageService;

    public AlbumController(AlbumRepository albumRepository, GameRepository gameRepository, ImageService imageService) {
        this.albumRepository = albumRepository;
        this.gameRepository = gameRepository;
        this.imageService = imageService;
    }
    
    @PutMapping("/{id}")
    ResponseEntity<Album> updateAlbum(@PathVariable Long id, @RequestBody AlbumRequest request) {
        return albumRepository.findById(id).map(album -> {
            if (request.getTitle() != null) album.setTitle(request.getTitle());
            if (request.getDescription() != null) album.setDescription(request.getDescription());
            if (request.getTags() != null) album.setTags(request.getTags());
            if (request.getIsPublic() != null) album.setPublic(request.getIsPublic());
            return ResponseEntity.ok(albumRepository.save(album));
        }).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    List<Album> listAlbums() {
        return albumRepository.findAllPublic();
    }

    @GetMapping("/{id}")
    ResponseEntity<Album> getAlbum(@PathVariable Long id) {
        return albumRepository.findByIdWithGames(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    Album createAlbum(@RequestBody AlbumRequest request) {
        Album album = new Album(request.getTitle());
        album.setDescription(request.getDescription());
        album.setTags(request.getTags());
        if (request.getIsPublic() != null) album.setPublic(request.getIsPublic());

        if (request.getImages() != null && !request.getImages().isEmpty()) {
            List<Image> images = new ArrayList<>();
            for (ImageRequest ir : request.getImages()) {
                Image image = new Image(ir);
                image.setAlbum(album);
                images.add(image);
            }
            List<Image> uploaded = imageService.uploadImages(images);
            album.getImages().addAll(uploaded);
        }

        Album saved = albumRepository.save(album);
        log.info("Created album {}: {}", saved.getId(), saved.getTitle());
        return saved;
    }

    @PostMapping("/{albumId}/games/{gameId}")
    ResponseEntity<Void> addGameToAlbum(@PathVariable Long albumId, @PathVariable Long gameId) {
        Album album = albumRepository.findById(albumId).orElse(null);
        Game game = gameRepository.findById(gameId).orElse(null);
        if (album == null || game == null) return ResponseEntity.notFound().build();

        album.addGame(game);
        albumRepository.save(album);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{albumId}/games/{gameId}")
    ResponseEntity<Void> removeGameFromAlbum(@PathVariable Long albumId, @PathVariable Long gameId) {
        Album album = albumRepository.findById(albumId).orElse(null);
        Game game = gameRepository.findById(gameId).orElse(null);
        if (album == null || game == null) return ResponseEntity.notFound().build();

        album.removeGame(game);
        albumRepository.save(album);
        gameRepository.save(game);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    ResponseEntity<Void> deleteAlbum(@PathVariable Long id) {
        return albumRepository.findById(id).map(album -> {
            // Detach games — they survive
            album.getGames().forEach(g -> g.setAlbum(null));
            albumRepository.delete(album);
            return ResponseEntity.ok().<Void>build();
        }).orElse(ResponseEntity.notFound().build());
    }
}