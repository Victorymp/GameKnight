package com.example.gamesknight.game;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.stereotype.Service;

import com.example.gamesknight.question.QuestionRepository;

import jakarta.transaction.Transactional;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;

    public GameService(GameRepository gameRepository, QuestionRepository questionRepository) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
    }

    @Transactional
    public Game startGame(String gameCode){
        Game game = new Game();
		try {
			game = gameRepository.findByGameCodeWithQuestions(gameCode)
			        .orElseThrow(() -> new NotFoundException());
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}

        // Populates .answers on the same managed Question instances above
        questionRepository.findByGameCodeWithAnswers(gameCode);

        game.startGame();
        return game;
    }
    
    @Transactional
    public Game getQr(String gameCode) {
    	Game game = new Game();
    	try {
    		game = gameRepository.findByGameCode(gameCode)
			        .orElseThrow(() -> new NotFoundException());
    		return game;
    	} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}
    	
    }
}