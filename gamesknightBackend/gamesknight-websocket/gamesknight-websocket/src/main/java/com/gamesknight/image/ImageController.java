package com.gamesknight.image;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/image")
public class ImageController {

    private final ImageRepository imageRepository;
    private final ImageService imageService;

    public ImageController(
            ImageRepository imageRepository,
            ImageService imageService) {
        this.imageRepository = imageRepository;
        this.imageService = imageService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<byte[]> getImage(@PathVariable Long id) {

        Image image = null;
		try {
			image = imageRepository.findById(id)
			        .orElseThrow(() -> new NotFoundException());
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        byte[] content = imageService.getImageBytes(image.getPath());

        return ResponseEntity.ok()
                .header("Content-Type", image.getType())
                .body(content);
    }
}
