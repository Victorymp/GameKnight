package com.example.gamesknight.game;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping(path="/Game")
public class GameControllerApi {
	
	private Game game;
	
	private static final Logger logger = LoggerFactory.getLogger(GameControllerApi.class);
	
	
	@PostMapping("/creategame")
	ResponseEntity<Game> create(@RequestBody Game game){
		logger.info("Creating game with code: {}", game.getGameCode());
		
		Game newGame = new Game()
				.createGame(game.getGameCode());
		
		logger.info("Game created successfully with code: {}", newGame.getGameCode());
		
		return ResponseEntity.ok(newGame);
	}

}
