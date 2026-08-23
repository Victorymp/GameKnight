package com.gamesknight.image;

import java.util.Base64;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.gamesknight.question.Question;
import com.gamesknight.storage.GameKnightStorage;

@Service
public class ImageService {
    private static final Logger log = LoggerFactory.getLogger(ImageService.class);

    // Cache: blob path -> base64-encoded image bytes
    private final ConcurrentMap<String, String> imageCache = new ConcurrentHashMap<>();

    // If your storage class already exposes container names as constants, use those.
    // Adjust this to match wherever IMAGE_CONTAINER is defined in your codebase.
    private static final String IMAGE_CONTAINER = GameKnightStorage.IMAGE_CONTAINER;

    private final GameKnightStorage storage;

    public ImageService(GameKnightStorage storage) {
        this.storage = storage;
    }

    /**
     * Populates the transient `content` field on each of the question's images
     * by fetching bytes from blob storage (via cache).
     * Safe to call multiple times — cached lookups are cheap.
     */
    public void hydrateImages(Question q) {
        if (q.getImages() == null || q.getImages().isEmpty()) return;
        for (Image img : q.getImages()) {
            if (img.getPath() == null || img.getPath().isEmpty()) continue;
            if (img.getContent() != null && !img.getContent().isEmpty()) continue; // already hydrated
            String cached = getCachedImageBase64(img.getPath());
            if (cached != null) {
                img.setContent(cached);
            }
        }
    }

    /**
     * Returns the base64 content for a single image path.
     * Used directly by the REST endpoint that serves images by question ID.
     */
    public String getImageBase64(String path) {
        if (path == null || path.isEmpty()) return null;
        return getCachedImageBase64(path);
    }

    /**
     * Clear a cached image (call after the underlying blob is updated).
     */
    public void invalidate(String path) {
        if (path != null) imageCache.remove(path);
    }

    private String getCachedImageBase64(String path) {
        return imageCache.computeIfAbsent(path, p -> {
            try {
                byte[] bytes = storage.getImage(p, IMAGE_CONTAINER);
                if (bytes == null) return null;
                return Base64.getEncoder().encodeToString(bytes);
            } catch (Exception e) {
                log.error("Failed to fetch image {}", p, e);
                return null;
            }
        });
    }
}