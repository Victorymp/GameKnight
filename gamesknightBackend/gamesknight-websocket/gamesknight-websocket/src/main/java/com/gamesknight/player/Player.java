package com.gamesknight.player;

public class Player {

    private String name;
    private String id;
    private int score;
    private int rank;

    public Player() {
    }

    public Player(String id, String name) {
        this.id = id;
        this.name = name;
        this.score = 0;
        this.rank = 0;
    }

    public Player(String id, String name, int score, int rank) {
        this.id = id;
        this.name = name;
        this.score = score;
        this.rank = rank;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public int getScore() {
        return score;
    }

    public void setScore(int score) {
        this.score = score;
    }

    public void addScore(int points) {
        this.score += points;
    }

    public int getRank() {
        return rank;
    }

    public void setRank(int rank) {
        this.rank = rank;
    }
}