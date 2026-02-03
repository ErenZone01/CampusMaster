package com.campusmaster.campusmaster.application.service;

import java.util.List;

import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.RessourceResponse;
import com.campusmaster.campusmaster.domain.model.user.Student;

public interface RessourceService {
    RessourceResponse add(Long courseId, String title, MultipartFile file);
    void delete(Long id);
    List<RessourceResponse> getRessourceByCourse(Student student ,Long courseId);
    ResponseEntity<UrlResource> download(Long id);
}
