package com.gamesknight.game;

import java.util.List;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.hateoas.EntityModel;
import org.springframework.stereotype.Service;

import com.gamesknight.image.Image;
import com.gamesknight.image.ImageRepository;
import com.gamesknight.image.ImageService;
import com.gamesknight.question.QuestionRepository;

import jakarta.transaction.Transactional;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final ImageRepository imageRepository;
    private ImageService imageService;

    public GameService(GameRepository gameRepository, QuestionRepository questionRepository, ImageRepository imageRepository,ImageService imageService) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.imageRepository = imageRepository;
        this.imageService = imageService;
    }

    @Transactional
    public Game startGame(String gameCode){
        Game game = new Game();
		try {
			game = gameRepository.findByGameCodeWithQuestions(gameCode)
		            .orElseThrow(() -> new NotFoundException());
			
			List<Image> images = imageRepository.findByGameId(game.getId());
			
			for (Image i: images) {
				game.addImage(i);
			}
			
//			game.setImages(images);
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