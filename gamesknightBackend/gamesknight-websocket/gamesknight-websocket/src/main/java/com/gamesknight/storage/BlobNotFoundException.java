package com.gamesknight.storage;

public class BlobNotFoundException extends RuntimeException {
    public BlobNotFoundException(String message) {
        super(message);
    }
}
