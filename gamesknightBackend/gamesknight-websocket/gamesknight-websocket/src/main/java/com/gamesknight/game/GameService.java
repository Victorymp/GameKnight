package com.gamesknight.game;

import java.util.List;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.stereotype.Service;

import com.gamesknight.image.Image;
import com.gamesknight.image.ImageRepository;
import com.gamesknight.question.QuestionRepository;

import jakarta.transaction.Transactional;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final ImageRepository imageRepository;

    public GameService(GameRepository gameRepository, QuestionRepository questionRepository, ImageRepository imageRepository) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.imageRepository = imageRepository;
    }

    @Transactional
    public Game startGame(String gameCode){
        Game game = new Game();
		try {
			game = gameRepository.findByGameCodeWithQuestions(gameCode)
		            .orElseThrow(() -> new NotFoundException());

		    Game gameWithImages = gameRepository.findByGameCodeWithImages(gameCode)
		            .orElseThrow(() -> new NotFoundException());

		    game.setImages(gameWithImages.getImages());
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
    
    @Transactional
    public Game getGame(String gameCode) {
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