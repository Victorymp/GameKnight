package com.gamesknight.game;

import io.github.cdimascio.dotenv.Dotenv;
import io.nayuki.qrcodegen.QrCode;
import jakarta.persistence.*;
import lombok.ToString;

import javax.imageio.ImageIO;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.azure.storage.blob.models.BlobStorageException;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.gamesknight.image.Image;
import com.gamesknight.question.Question;
import com.gamesknight.storage.BlobNotFoundException;
import com.gamesknight.storage.GameKnightStorage;

import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Entity
@ToString(exclude = "questions")
public class Game {
	
	
	private static final Dotenv env = Dotenv.configure()
		    .ignoreIfMissing()
		    .load();
	private static final String API_URL = env.get("API_URL");

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gameCode;
    private String gameQrB64;
    @Transient
    private String qrImageBase64;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Question> questions = new ArrayList<>();
    
    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Image> images = new ArrayList<>();
    
    private static final Logger logger = LoggerFactory.getLogger(Game.class);
    
    protected Game() {
    	
    }
    
    public Game(String gameCode) {
    	this.gameCode = gameCode;
    }
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
    
    public String getQrImageBase64() { 
    	return qrImageBase64;
    }

    public void setQrImageBase64(String qrImageBase64) {
        this.qrImageBase64 = qrImageBase64;
    }
    
    public String getGameCode() {
        return gameCode;
    }

    public void setGameCode(String gameCode) {
        this.gameCode = gameCode;
    }

    public String getGameQrB64() {
        return gameQrB64;
    }

    public void setGameQrB64(String gameQrB64) {
        this.gameQrB64 = gameQrB64;
    }

    public List<Question> getQuestions() {
        return questions;
    }

    public void addQuestion(Question question) {
        questions.add(question);
        question.setGame(this);
    }

    public void removeQuestion(Question question) {
        questions.remove(question);
        question.setGame(null);
    }
    
    public void setImages() {
    	if (images.size() > 0) images = new GameKnightStorage().setImage(this.images);
    }
    
    public void setImages(List<Image> imageImport) {
    	if (imageImport.size() > 0) this.images = new GameKnightStorage().setImage(imageImport);
    }
    
    public List<Image> getImages() {
    	return this.images;
    }
    
    public void addImage(Image image) {
    	images.add(image);
    	image.setGame(this);
    }
    
    public void removeImage(Image image) {
    	images.remove(image);
    	image.setGame(null);
    }
    
//    public Game startGame() {
//        String blobName = "qr-" + this.gameCode + ".png";
//        try {
//            byte[] qrBytes = new GameKnightStorage().getQrIamage(blobName);
//            this.qrImageBase64 = Base64.getEncoder().encodeToString(qrBytes);
//        } catch (BlobNotFoundException e) {
//            // Blob missing — regenerate the QR, upload it, and encode it for the response
//            try {
//                String gameUrl = API_URL + "/player/join/" + this.gameCode;
//                String qrBytesBase64 = generateQrcode(gameUrl);   // returns base64 string
//                // String qrBlobUrl = new GameKnightStorage().uploadQr(blobName, qrBytesBase64);
//                // this.setGameQrB64(qrBlobUrl);                     // URL stays in the column (small, fits)
//                this.qrImageBase64 = qrBytesBase64;               // base64 goes in the transient field
//            } catch (Exception ex) {
//                logger.error("Failed to regenerate QR code for game {}", this.gameCode, ex);
//            }
//        } catch (Exception e) {
//            logger.error("Failed to fetch QR code for game {}", this.gameCode, e);
//        }
//        return this;
//    }
    
    public Game startGame() {
        String blobName = "qr-" + this.gameCode + ".png";
        try {
            byte[] qrBytes = new GameKnightStorage().getQrIamage(blobName);
            this.qrImageBase64 = Base64.getEncoder().encodeToString(qrBytes);
        } catch (BlobNotFoundException e) {
            // Blob missing — regenerate
            try {
                String gameUrl = API_URL + "/player/join/" + this.gameCode;
                this.qrImageBase64 = generateQrcode(gameUrl);
            } catch (Exception ex) {
                logger.error("Failed to regenerate QR code for game {}", this.gameCode, ex);
            }
        } catch (Exception e) {
            logger.error("Failed to fetch QR code for game {}", this.gameCode, e);
        }
        return this;
    }
    
    

    public Game createGame() {
        String gameUrl = API_URL + "/player/join/" + gameCode;
        try {
            String qrBase64 = generateQrcode(gameUrl);
            String blobName = "qr-" + gameCode + ".png";

            String qrBlobUrl = new GameKnightStorage().uploadQr(blobName, qrBase64);
            this.setGameQrB64(qrBlobUrl);        // URL persisted
            this.setQrImageBase64(qrBase64);     // base64 returned in response, @Transient
        } catch (Exception e) {
            logger.error("Failed to generate/upload QR code for game {}", gameCode, e);
        }
        return this;
    }
    
    public void generateQrCode() throws Exception {
    	String gameUrl = API_URL + "/player/join/" + gameCode;
    	gameQrB64 = generateQrcode(gameUrl);
    	
    }

    public String generateQrcode(String gameUrl) throws Exception {
        QrCode qrCode = QrCode.encodeText(gameUrl, QrCode.Ecc.MEDIUM);
        int scale = 10;
        int border = 4;
        int size = qrCode.size;
        BufferedImage image = new BufferedImage(
                (size + border * 2) * scale,
                (size + border * 2) * scale,
                BufferedImage.TYPE_INT_RGB
        );
        for (int y = 0; y < size + border * 2; y++) {
            for (int x = 0; x < size + border * 2; x++) {
                boolean dark =
                        x >= border &&
                        x < size + border &&
                        y >= border &&
                        y < size + border &&
                        qrCode.getModule(x - border, y - border);
                int rgb = dark ? 0x000000 : 0xFFFFFF;
                for (int dy = 0; dy < scale; dy++) {
                    for (int dx = 0; dx < scale; dx++) {
                        image.setRGB(x * scale + dx, y * scale + dy, rgb);
                    }
                }
            }
        }
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        ImageIO.write(image, "PNG", outputStream);
        return Base64.getEncoder().encodeToString(outputStream.toByteArray());
    }
    
    @Override
    public String toString() {
        return "Game{" +
                "id=" + id +
                ", gameCode='" + gameCode + '\'' +
                ", gameQrB64='" + truncate(gameQrB64, 60) + '\'' +
                ", questionCount=" + (questions == null ? 0 : questions.size()) +
                ", qrImageBase64Length=" + (qrImageBase64 == null ? 0 : qrImageBase64.length()) +
                '}';
    }

    private static String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() <= max ? s : s.substring(0, max) + "...(" + s.length() + " chars)";
    }
}