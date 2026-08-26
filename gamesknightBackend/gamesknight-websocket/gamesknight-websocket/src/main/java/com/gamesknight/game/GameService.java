package com.gamesknight.game;

import java.util.Base64;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;
import org.springframework.hateoas.EntityModel;
import org.springframework.stereotype.Service;

import com.gamesknight.image.Image;
import com.gamesknight.image.ImageRepository;
import com.gamesknight.image.ImageService;
import com.gamesknight.question.QuestionRepository;
import com.gamesknight.storage.BlobNotFoundException;
import com.gamesknight.storage.GameKnightStorage;

import jakarta.transaction.Transactional;

@Service
public class GameService {

    private final GameRepository gameRepository;
    private final QuestionRepository questionRepository;
    private final ImageRepository imageRepository;
    private ImageService imageService;
    private static final Logger logger = LoggerFactory.getLogger(GameService.class);

    public GameService(GameRepository gameRepository, QuestionRepository questionRepository, ImageRepository imageRepository,ImageService imageService) {
        this.gameRepository = gameRepository;
        this.questionRepository = questionRepository;
        this.imageRepository = imageRepository;
        this.imageService = imageService;
    }

    @Transactional
    public Game startGame(String gameCode){
        Game game = new Game();
        String qrBlobName = null;
		try {
			game = gameRepository.findByGameCodeWithQuestions(gameCode)
		            .orElseThrow(() -> new NotFoundException());
			
			List<Image> images = imageRepository.findByGameId(game.getId());
			
			for (Image i: images) {
				game.addImage(i);
				if (i.getBlobName().contains("qr")) {
					qrBlobName = i.getBlobName();
				}
			}
			
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
		}


        // Populates .answers on the same managed Question instances above
        questionRepository.findByGameCodeWithAnswers(gameCode);
        if (qrBlobName == null || qrBlobName.isEmpty()) {
        	qrBlobName = "qr-" + game.getGameCode() + ".png";
        }
      
        return startGame(game,qrBlobName);
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
    
    @Transactional
    public Game startGame(Game game, String blobName) {
        try {
            byte[] qrBytes = new GameKnightStorage().getQrIamage(blobName);
            String qrImageBase64 = Base64.getEncoder().encodeToString(qrBytes);
            game.setQrImageBase64(qrImageBase64);
        } catch (BlobNotFoundException e) {
            // Blob missing — regenerate
            try {
                game.generateQrCode();
            } catch (Exception ex) {
                logger.error("Failed to regenerate QR code for game {}", game.getGameCode(), ex);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch QR code for game {}", game.getGameCode(), e);
        }
        return game;
    }
}