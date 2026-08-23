package com.gamesknight.question;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.gamesknight.image.Image;
import com.gamesknight.image.ImageService;

import java.util.Map;

@RestController
@RequestMapping(path = "/question")
public class QuestionController {

    private final QuestionRepository questionRepository;
    private final ImageService imageService;

    public QuestionController(
            QuestionRepository questionRepository,
            ImageService imageService
    ) {
        this.questionRepository = questionRepository;
        this.imageService = imageService;
    }

    @GetMapping("/{questionId}/image")
    ResponseEntity<Map<String, String>> getQuestionImage(@PathVariable Long questionId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        imageService.hydrateImages(q);

        // Return the primary image's base64 content (or first, if no primary)
        Image primary = q.getImages().stream()
                .filter(Image::isPrimary)
                .findFirst()
                .orElse(q.getImages().isEmpty() ? null : q.getImages().get(0));

        if (primary == null || primary.getContent() == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok()
                .header("Cache-Control", "public, max-age=3600")
                .body(Map.of(
                    "type", primary.getType() != null ? primary.getType() : "image/png",
                    "content", primary.getContent()
                ));
    }
}