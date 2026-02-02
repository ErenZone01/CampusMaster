package com.campusmaster.campusmaster.presentation.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.service.FileStorageService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/files")
@Tag(name = "Files", description = "Accès aux fichiers")
@RequiredArgsConstructor
public class FileController {

    private final FileStorageService fileStorageService;

    @PostMapping("/upload/{folder}")
    @Operation(summary = "Upload un fichier", description = "Uploader un fichier dans un dossier spécifique")
    public ResponseEntity<Map<String, String>> uploadFile(
            @PathVariable String folder,
            @RequestParam("file") MultipartFile file) {
        
        String filename = fileStorageService.storeFile(file, folder);
        String url = "http://localhost:8080/api/files/" + filename;
        
        Map<String, String> response = new HashMap<>();
        response.put("url", url);
        response.put("filename", filename);
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{folder}/{filename}")
    @Operation(summary = "Télécharger un fichier", description = "Récupérer un fichier uploadé")
    public ResponseEntity<ByteArrayResource> downloadFile(
            @PathVariable String folder,
            @PathVariable String filename) {
        
        byte[] data = fileStorageService.loadFile(folder + "/" + filename);
        ByteArrayResource resource = new ByteArrayResource(data);

        String contentType = "application/octet-stream";
        if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) {
            contentType = "image/jpeg";
        } else if (filename.endsWith(".png")) {
            contentType = "image/png";
        } else if (filename.endsWith(".webp")) {
            contentType = "image/webp";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .body(resource);
    }
}
