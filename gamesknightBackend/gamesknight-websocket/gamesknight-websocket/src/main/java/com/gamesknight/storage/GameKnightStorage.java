package com.gamesknight.storage;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import com.azure.storage.blob.BlobClient;
import com.azure.storage.blob.BlobContainerClient;
import com.azure.storage.blob.BlobServiceClient;
import com.azure.storage.blob.BlobServiceClientBuilder;
import com.azure.storage.blob.models.BlobStorageException;
import com.gamesknight.image.Image;

import io.github.cdimascio.dotenv.Dotenv;

@Component
public class GameKnightStorage {

	private static final Logger logger = LoggerFactory.getLogger(GameKnightStorage.class);
    private final BlobServiceClient blobServiceClient;
    private static final Dotenv env = Dotenv.configure()
    	    .ignoreIfMissing()
    	    .load();
    private static final String CONNECTION_STRING = env.get("AZURE_STORAGE_CONNECTION_STRING");
    private static final String QR_CONTAINER = env.get("AZURE_STORAGE_QR_CONTAINER");
    public static final String IMAGE_CONTAINER = env.get("AZURE_STORAGE_IMAGE_CONTAINER");
    
    public GameKnightStorage() {
    	
        this.blobServiceClient = new BlobServiceClientBuilder()
                .connectionString(CONNECTION_STRING)
                .buildClient();
        
        logger.info("Azure Storage connection string loaded successfully.");
    }
    
    public String uploadImage(Image image) {
        String base64Payload = image.getContent().contains(",")
                ? image.getContent().substring(image.getContent().indexOf(",") + 1)
                : image.getContent();
        byte[] data = Base64.getDecoder().decode(base64Payload);
        switch (image.getType()) {
            case "QR":
                return uploadImage(image.getPath(), data, QR_CONTAINER);

            case "IMAGE":
                return uploadImage(image.getPath(), data, IMAGE_CONTAINER);

            default:
                throw new IllegalArgumentException("Unknown image type: " + image.getType());
        }
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
	
	public byte[] getImage(Image image) {
		switch(image.getPath()) {
			case "QR":
				return getImage(image.getPath(), QR_CONTAINER);
			case "IMAGE":
				return getImage(image.getPath(), IMAGE_CONTAINER);
		}
		return getImage(image.getPath(), IMAGE_CONTAINER);
	}
	
	public List<Image> setImage(List<Image> images) {
	    List<Image> result = new ArrayList<>();
	    for (Image image : images) {
	        // Skip if there's nothing to upload
	        if (image.getContent() == null || image.getContent().isEmpty()) {
	            result.add(image);
	            continue;
	        }

	        // Generate a path if the client didn't supply one
	        String blobName = image.getPath();
	        if (blobName == null || blobName.isEmpty()) {
	            String ext = extensionFor(image.getType());
	            blobName = "img-" + UUID.randomUUID() + ext;
	            image.setPath(blobName);
	        }

	        String base64Payload = image.getContent().contains(",")
	            ? image.getContent().substring(image.getContent().indexOf(",") + 1)
	            : image.getContent();
	        byte[] data = Base64.getDecoder().decode(base64Payload);

	        String container = "QR".equals(image.getCategory()) ? QR_CONTAINER : IMAGE_CONTAINER;
	        String url = uploadImage(blobName, data, container);

	        // Optionally store the URL, or leave path as the blob name
	        image.setPath(blobName);
	        // Clear content so the base64 doesn't get persisted (it's @Transient anyway)
	        image.setContent(null);

	        result.add(image);
	    }
	    return result;
	}

	private String extensionFor(String mimeType) {
	    if (mimeType == null) return "";
	    if (mimeType.contains("png")) return ".png";
	    if (mimeType.contains("jpeg") || mimeType.contains("jpg")) return ".jpg";
	    if (mimeType.contains("gif")) return ".gif";
	    if (mimeType.contains("webp")) return ".webp";
	    return "";
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
	
    public byte[] getImage(String blobName, String containerName) {
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