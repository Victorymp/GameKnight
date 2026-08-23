package com.gamesknight.storage;

public class BlobNotFoundException extends RuntimeException {
    /**
	 * 
	 */
	private static final long serialVersionUID = 1L;

	public BlobNotFoundException(String message) {
        super(message);
    }
}
