package com.gamesknight.storage;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.gamesknight.game.Game;
import com.gamesknight.session.GameController;
import com.github.benmanes.caffeine.cache.Cache;
import com.github.benmanes.caffeine.cache.Caffeine;

public class GameKnightCaching {
	
	private static GameKnightCaching instance = null; 
	
	private static final Logger log = LoggerFactory.getLogger(GameKnightCaching.class);
	
	private final Cache<String, Game> activeGames = Caffeine.newBuilder()
	        .expireAfterAccess(30, TimeUnit.MINUTES)
	        .maximumSize(10_000)
	        .build();
	
	public GameKnightCaching() {
		
	}
	
	public void addGame(String oneTimeGameCode, Game game) {
		log.info("Adding active game: "+oneTimeGameCode);
		activeGames.put(oneTimeGameCode, game);
	}
	
	public Game getGame(String oneTimeGameCode) {
		Game ag = activeGames.getIfPresent(oneTimeGameCode);
		ag.setOneTimeGameCode(oneTimeGameCode);
		log.info("Found game: "+ag.getGameCode());
		return ag;
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
