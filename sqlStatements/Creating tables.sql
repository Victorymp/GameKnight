CREATE TABLE `game` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `game_code` varchar(255) DEFAULT NULL,
  `game_qr_b64` varchar(255) DEFAULT NULL,
  `game_title` varchar(255) DEFAULT NULL,
  `album_id` bigint DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`),
  KEY `FKp9tyqc7531x4qsb4lcnermjm8` (`album_id`),
  CONSTRAINT `FKp9tyqc7531x4qsb4lcnermjm8` FOREIGN KEY (`album_id`) REFERENCES `albums` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE questions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(1000) NOT NULL,
    image_data LONGTEXT,
    game_id BIGINT NOT NULL,
    CONSTRAINT fk_questions_game
        FOREIGN KEY (game_id) REFERENCES game(id)
        ON DELETE CASCADE
); 

CREATE TABLE answers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    text VARCHAR(500) NOT NULL,
    correct BOOLEAN NOT NULL DEFAULT FALSE,
    question_id BIGINT NOT NULL,
    CONSTRAINT fk_answers_question
        FOREIGN KEY (question_id) REFERENCES questions(id)
        ON DELETE CASCADE
);

CREATE TABLE `albums` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `description` varchar(1000) DEFAULT NULL,
  `is_public` bit(1) NOT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `tags` varchar(500) DEFAULT NULL,
  `title` varchar(200) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;