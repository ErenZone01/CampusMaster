package com.campusmaster.campusmaster.application.service;

import org.springframework.web.multipart.MultipartFile;

public interface FileStorageService {
    String storeFile(MultipartFile file, String folder);
    
    byte[] loadFile(String filename);
    
    void deleteFile(String filename);
    
    String getFileUrl(String filename);
}
