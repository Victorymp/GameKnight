package com.gamesknight.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.azure.storage.blob.models.BlobStorageException;
import com.gamesknight.answer.Answer;
import com.gamesknight.answer.AnswerRequest;
import com.gamesknight.image.Image;
import com.gamesknight.image.ImageRequest;
import com.gamesknight.question.Question;
import com.gamesknight.question.QuestionRepository;
import com.gamesknight.question.QuestionRequest;

import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping(path = "/game")
public class GameControllerApi {

    @Autowired
    private final GameRepository repository;

    @Autowired
    private final QuestionRepository questionRepository;
    
    private GameService gameService;

    private final GameModelAssembler assembler;

    private static final Logger logger = LoggerFactory.getLogger(GameControllerApi.class);

    public GameControllerApi(GameRepository repository, QuestionRepository questionRepository, GameModelAssembler assembler, GameService gameservice) {
        this.repository = repository;
        this.questionRepository = questionRepository;
        this.assembler = assembler;
        this.gameService = gameservice;
    }

    @Transactional
	@PostMapping("/startgame")
	ResponseEntity<Game> create(@RequestBody GameRequest request) {
	    logger.info("Creating game with code: {}", request.getGameCode());
	    String gameCode = request.getGameCode();
	    Game chosenGame = gameService.startGame(gameCode);
//	    Game chosenGame = repository.findByGameCode(gameCode)
//				.orElseThrow(() -> new GameNotFoundException(gameCode));
	    
	    chosenGame.startGame();

	    logger.info("Game created successfully with code: {}", chosenGame.getGameCode());
	    logger.info("Game: {}",chosenGame.toString());
	    return ResponseEntity
	    		.status(HttpStatus.OK)
	    		.body(chosenGame);
	}
	
    @PostMapping("/creategame")
    ResponseEntity<Game> newGame(@RequestBody GameRequest request) {
        logger.info("Creating game with code: {}", request.getGameCode());
        logger.info(request.getGameCode());
        logger.info("Game request");
        logger.info(request.toString());
        Game newGame = new Game();
        
        newGame.setGameCode(request.getGameCode());
        
        if (request.getQuestions() != null) {
            for (QuestionRequest qr : request.getQuestions()) {
                Question question = new Question(qr.getText(), newGame);
                
                if (qr.getImages() != null) {
                	for (ImageRequest ir: qr.getImages()) {
                		
                		question.addImage(new Image(ir, question));
                	}
                }
                
                question.setImages();

                if (qr.getAnswers() != null) {
                    for (AnswerRequest ar : qr.getAnswers()) {
                        question.addAnswer(new Answer(ar.getText(), ar.isCorrect()));
                    }
                }
                newGame.addQuestion(question);
            }
        }
        
        if (request.getImages() != null) {
        	for (ImageRequest ir: request.getImages()) {
        		Image image = new Image(ir);
        		image.setGame(newGame);
        		
        		newGame.addImage(image);
        	}
        }
        
        try {        	
        	newGame = newGame.createGame();
        } catch (BlobStorageException b) {
        	b.printStackTrace();
        }
        
        newGame = repository.save(newGame); // cascades: saves questions + answers too
        logger.info("Game created with code: {}, id: {}, {} question(s)",
                newGame.getGameCode(), newGame.getId(), newGame.getQuestions().size());

        return ResponseEntity.ok(newGame);
    }
    
    @PostMapping("/game")
    ResponseEntity<Game> getGame(@RequestBody GameRequest request) {
	    logger.info("Gettinf game with code: {}", request.getGameCode());
	    String gameCode = request.getGameCode();
	    Game chosenGame = gameService.getGame(gameCode);

	    logger.info("Game found successfully with code: {}", chosenGame.getGameCode());
	    logger.info("Game: {}",chosenGame.toString());
	    return ResponseEntity
	    		.status(HttpStatus.OK)
	    		.body(chosenGame);
    }
    
    ResponseEntity<String> generateqr(@RequestBody GameRequest request) {
    	logger.info("Creating game code with code: {}", request.getGameCode());
        logger.info(request.getGameCode());
        logger.info("Game request");
        logger.info(request.toString());
        
        Game newGame = new Game(request.getGameCode());
        
        newGame = gameService.getQr(newGame.getGameCode());
        
        if (newGame.getGameCode() == null ) {
        	try {
				newGame.generateQrCode();
			} catch (Exception e) {
				// TODO Auto-generated catch block
				e.printStackTrace();
			}
        }
        
        return ResponseEntity.ok(newGame.getGameQrB64());
        
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
        if (request.getImages() != null) {
        	for (ImageRequest ir: request.getImages()) {
        		question.addImage(new Image(ir, question));
        	}
        }
        
        question.setImages();

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
    
    @GetMapping("/{id}") 
    ResponseEntity<Game> fetchGame(@PathVariable Long id){
    	Game g = repository.findById(id)
    			.orElseThrow(() -> new EntityNotFoundException("Game not found: "+ id));
    	
    	return ResponseEntity
	    		.status(HttpStatus.OK)
	    		.body(g);
    }
}