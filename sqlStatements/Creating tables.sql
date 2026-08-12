CREATE TABLE game (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    game_code VARCHAR(255),
    game_qr_b64 LONGTEXT
);

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