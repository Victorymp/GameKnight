package com.gamesknight.game;

import org.springframework.data.crossstore.ChangeSetPersister.NotFoundException;

public class GameNotFoundException extends NotFoundException {

	public GameNotFoundException(String gameCode) {
		super();
	}

}
