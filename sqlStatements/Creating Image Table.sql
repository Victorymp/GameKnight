CREATE TABLE image (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    is_thumbnails BOOLEAN NOT NULL DEFAULT FALSE,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    title VARCHAR(255),
    type VARCHAR(100),
    path VARCHAR(500),
    game_id BIGINT NOT NULL,

    CONSTRAINT fk_image_game
        FOREIGN KEY (game_id)
        REFERENCES game(id)
        ON DELETE CASCADE
);