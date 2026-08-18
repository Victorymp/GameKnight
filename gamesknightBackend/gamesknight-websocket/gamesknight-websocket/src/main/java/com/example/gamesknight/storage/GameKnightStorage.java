package com.example.gamesknight.storage;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.Base64;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobStorageException;

import io.github.cdimascio.dotenv.Dotenv;

public class GameKnightStorage {

    private final BlobServiceClient blobServiceClient;
    private static final Dotenv env = Dotenv.configure()
    	    .ignoreIfMissing()
    	    .load();
    private static final String CONNECTION_STRING = env.get("AZURE_STORAGE_CONNECTION_STRING");
    private static final String QR_CONTAINER = env.get("AZURE_STORAGE_QR_CONTAINER");
    private static final String IMAGE_CONTAINER = env.get("AZURE_STORAGE_IMAGE_CONTAINER");

    public GameKnightStorage() {
        this.blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(CONNECTION_STRING)
                .buildClient();
    }
	
	public String uploadQr(String blobName, String base64Data) throws BlobStorageException{
		String base64Payload = base64Data.contains(",")
		        ? base64Data.substring(base64Data.indexOf(",") + 1)
		        : base64Data;

		byte[] data = Base64.getDecoder().decode(base64Payload);
		
		return uploadImage(blobName, data, QR_CONTAINER);
	}
	
	public String uploadQuestionImage(String blobName, byte[] data) throws BlobStorageException{
		return uploadImage(blobName, data, IMAGE_CONTAINER);
	}
	
	
	public byte[] getQrIamage(String blobName) {
		return getImage(blobName, QR_CONTAINER);
	}
	
	public byte[] getImage(String blobName) {
		return getImage(blobName, IMAGE_CONTAINER);
	}

	private String uploadImage(String blobName, byte[] data, String containerName) {
	    BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
	    BlobClient blobClient = containerClient.getBlobClient(blobName);
	    blobClient.upload(new ByteArrayInputStream(data), data.length, true);
	    return blobClient.getBlobUrl();
	}
	
    private byte[] getImage(String blobName, String containerName) {
        BlobContainerClient containerClient = blobServiceClient.getBlobContainerClient(containerName);
        BlobClient blobClient = containerClient.getBlobClient(blobName);

        if (!blobClient.exists()) {
            throw new BlobNotFoundException("Blob not found: " + blobName);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        blobClient.downloadStream(outputStream);
        return outputStream.toByteArray();
    }

}