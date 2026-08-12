package com.example.gamesknight.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.persistence.EntityNotFoundException;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping(path = "/game")
public class GameControllerApi {

    @Autowired
    private GameRepository repository;

    @Autowired
    private QuestionRepository questionRepository;

    private final GameModelAssembler assembler;

    private static final Logger logger = LoggerFactory.getLogger(GameControllerApi.class);

    public GameControllerApi(GameRepository repository, QuestionRepository questionRepository, GameModelAssembler assembler) {
        this.repository = repository;
        this.questionRepository = questionRepository;
        this.assembler = assembler;
    }

    @PostMapping("/creategame")
    ResponseEntity<Game> create(@RequestBody GameRequest request) {
        logger.info("Creating game with code: {}", request.getGameCode());

        Game newGame = new Game().createGame(request.getGameCode());
        newGame = repository.save(newGame); // ← was missing: game was never persisted
        logger.info("Game created successfully with code: {}, id: {}", newGame.getGameCode(), newGame.getId());

        return ResponseEntity.ok(newGame);
    }

    public EntityModel<Game> getSingleGame(Long id) {
        Game game = repository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException());

        return assembler.toModel(game);
    }

    @GetMapping("/all")
    CollectionModel<EntityModel<Game>> all() {
        List<EntityModel<Game>> games = repository.findAll().stream()
                .map(assembler::toModel)
                .collect(Collectors.toList());
        return CollectionModel.of(games);
    }

    @PostMapping("/{gameId}/questions")
    ResponseEntity<Question> addQuestion(@PathVariable Long gameId, @RequestBody QuestionRequest request) {
        Game game = repository.findById(gameId)
                .orElseThrow(() -> new EntityNotFoundException("Game not found: " + gameId));

        Question question = new Question(request.getText(), game);
        question.setImageData(request.getImageData());

        if (request.getAnswers() != null) {
            for (AnswerRequest answerRequest : request.getAnswers()) {
                Answer answer = new Answer(answerRequest.getText(), answerRequest.isCorrect());
                question.addAnswer(answer);
            }
        }

        game.addQuestion(question);
        repository.save(game); // cascades: saves the new Question and its Answers too

        logger.info("Added question '{}' to game {} with {} answer(s)",
                question.getText(), game.getGameCode(), question.getAnswers().size());

        return ResponseEntity.ok(question);
    }

    @GetMapping("/{gameId}/questions")
    ResponseEntity<List<Question>> getQuestions(@PathVariable Long gameId) {
        if (!repository.existsById(gameId)) {
            throw new EntityNotFoundException("Game not found: " + gameId);
        }
        List<Question> questions = questionRepository.findByGameId(gameId);
        return ResponseEntity.ok(questions);
    }
}