package com.example.gamesknight.game;

import io.nayuki.qrcodegen.QrCode;
import jakarta.persistence.*;
import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@Entity
public class Game {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String gameCode;
    private String gameQrB64;

    @OneToMany(mappedBy = "game", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Question> questions = new ArrayList<>();

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

    public Game createGame(String gameCode) {
        this.gameCode = gameCode;
        String gameUrl = "http://192.168.1.220:5173/player/join/" + this.gameCode;
        try {
            this.gameQrB64 = this.generateQrcode(gameUrl);
        } catch (Exception e) {
            e.printStackTrace();
        }
        return this;
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

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}