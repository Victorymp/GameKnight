package com.example.gamesknight.game;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.hateoas.CollectionModel;
import org.springframework.hateoas.EntityModel;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import jakarta.persistence.EntityNotFoundException;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping(path="/Game")
public class GameControllerApi {
	
	private Game game;
	
	@Autowired
	private GameRepository repository;
	
	private final GameModelAssembler assembler;
	
	private static final Logger logger = LoggerFactory.getLogger(GameControllerApi.class);
	
	public GameControllerApi(GameRepository repository, GameModelAssembler assembler) {
		
		this.repository = repository;
		this.assembler = assembler;
		
	}
	
	
	@PostMapping("/creategame")
	ResponseEntity<Game> create(@RequestBody GameRequest request) {
	    logger.info("Creating game with code: {}", request.getGameCode());
	    
	    Game newGame = new Game().createGame(request.getGameCode());

	    logger.info("Game created successfully with code: {}", newGame.getGameCode());
	    logger.info("Game: {}",newGame.toString());

	    return ResponseEntity.ok(newGame);
	
	}


	public EntityModel<Game> getSingleGame(Long id) {
		Game game = repository.findById(id)
				.orElseThrow(() -> new EntityNotFoundException());
		
		return assembler.toModel(game);
	}
	
	CollectionModel<EntityModel<Game>> all() {
	    List<EntityModel<Game>> games = repository.findAll().stream()
	            .map(assembler::toModel)
	            .collect(Collectors.toList());
	    return CollectionModel.of(games);
	}

}
