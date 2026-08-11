package com.example.gamesknight.game;

public class GameRequest {

    private String gameCode;

    public GameRequest() {}

    public GameRequest(String gameCode) {
        this.gameCode = gameCode;
    }

    public String getGameCode() {
        return gameCode;
    }

    public void setGameCode(String gameCode) {
        this.gameCode = gameCode;
    }
}