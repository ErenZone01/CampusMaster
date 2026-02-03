package com.campusmaster.campusmaster.application.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;


@Service
public class SaveRessourcesImpl {

    @Value("${file.upload-dir}")
    private String uploadDir;

    public void SaveRessource(MultipartFile file, String title){
        // 1️⃣ Créer le dossier du cours
        Path courseDir = Paths.get(uploadDir, "courses");
        try {
            Files.createDirectories(courseDir);
        } catch (IOException e) {
            throw new RuntimeException("Could not create directory");
        }

        Path filePath = Path.of(courseDir.toString(), file.getOriginalFilename());
        // 3️⃣ Écrire le fichier sur disque
        try {
            Files.copy(file.getInputStream(), filePath);
        } catch (IOException e) {
            throw new RuntimeException("Could not store file");
        }
    }

}
