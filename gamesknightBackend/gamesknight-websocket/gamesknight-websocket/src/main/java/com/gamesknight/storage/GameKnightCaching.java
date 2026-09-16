package com.gamesknight.storage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import com.gamesknight.game.Game;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class GameKnightCaching {
	
	private static GameKnightCaching instance = null; 
	
	private final Cache<String, Game> activeGames = Caffeine.newBuilder()
	        .expireAfterAccess(30, TimeUnit.MINUTES)
	        .maximumSize(10_000)
	        .build();
	
	public GameKnightCaching() {
		
	}
	
	public void addGame(String oneTimeGameCode, Game game) {
		activeGames.put(oneTimeGameCode, game);
	}
	
	public Game getGame(String oneTimeGameCode) {
		return activeGames.getIfPresent(oneTimeGameCode);
	}
	
	public static GameKnightCaching getInstance()
    {
        if (instance == null)
        	instance = new GameKnightCaching();

        return instance;
    }
	
	public void removeGame(String oneTimeGameCode) {
		activeGames.invalidate(oneTimeGameCode);
	}
}
