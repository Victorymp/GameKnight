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
import com.gamesknight.storage.GameKnightCaching;
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
        String oneTimeGameCode = String.valueOf(100000 + (int) (Math.random() * 999999));
        logger.info("One time code: "+oneTimeGameCode);
        String qrBlobName = null;
		try {
			game = gameRepository.findByGameCodeWithQuestions(gameCode)
		            .orElseThrow(() -> new NotFoundException());
			
			game.setOneTimeGameCode(oneTimeGameCode);
			
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
        GameKnightCaching cache = GameKnightCaching.getInstance();
        cache.addGame(oneTimeGameCode, game);
        
        try {
        	String gameUrl = game.getGameUrl(game.getOneTimeGameCode());
        	String qr = game.generateQrcode(gameUrl);
//            byte[] qrBytes = new GameKnightStorage().getQrIamage(blobName);
            String qrImageBase64 = qr;
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
    
    
    @Transactional
    public Game getGameSession(String oneTimeGameCode, String i) {
		try {
			Game game = GameKnightCaching.getInstance().getGame(oneTimeGameCode);
			if (game == null) {
				throw new NotFoundException();
			}
			
			return game;
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}	
    }
    
    @Transactional
    public Game getGameData(String gameCode) {
		try {
			Game game = gameRepository.findByGameCode(gameCode)
					.orElseThrow(() -> new NotFoundException());
			return game;
		} catch (NotFoundException e) {
			// TODO Auto-generated catch block
			e.printStackTrace();
			return null;
		}	
    }
    
}