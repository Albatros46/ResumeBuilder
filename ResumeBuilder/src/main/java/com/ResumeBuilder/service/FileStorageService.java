package com.ResumeBuilder.service;

import com.ResumeBuilder.exception.BadRequestException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.Map;
import java.util.UUID;

@Service
@Slf4j
public class FileStorageService {

    private static final Map<String, String> ALLOWED_TYPES = Map.of(
            "image/jpeg", ".jpg",
            "image/png", ".png",
            "image/webp", ".webp",
            "image/gif", ".gif"
    );

    private final Path uploadPath;
    private final String baseUrl;

    public FileStorageService(@Value("${app.upload.dir}") String uploadDir,
                              @Value("${app.base-url}") String baseUrl) throws IOException {
        this.uploadPath = Path.of(uploadDir).toAbsolutePath().normalize();
        this.baseUrl = baseUrl;
        Files.createDirectories(uploadPath);
    }

    public String storeImage(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("File is empty.");
        }
        String extension = ALLOWED_TYPES.get(file.getContentType());
        if (extension == null) {
            throw new BadRequestException("Only JPG, PNG, WEBP and GIF images are allowed.");
        }

        // Dosya adi istemciden alinmaz; path traversal riskine karsi rastgele isim uretilir.
        String fileName = UUID.randomUUID() + extension;
        try (InputStream in = file.getInputStream()) {
            Files.copy(in, uploadPath.resolve(fileName), StandardCopyOption.REPLACE_EXISTING);
        } catch (IOException e) {
            log.error("Dosya kaydedilemedi: {}", e.getMessage());
            throw new BadRequestException("File could not be saved.");
        }
        return baseUrl + "/uploads/" + fileName;
    }
}
