package com.campusmaster.campusmaster.application.service.impl;

import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.RessourceResponse;
import com.campusmaster.campusmaster.application.service.RessourceService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.ressource.Ressource;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.RessourceRepository;

@Service
public class RessourceServiceImpl implements RessourceService {

    @Value("${file.upload-dir}")
    private String uploadDir;

    @Autowired
    private RessourceRepository ressourceRepository;
    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private SaveRessourcesImpl saveRessourcesImpl;

    @Override
    public RessourceResponse add(Long courseId, String title, MultipartFile file) {
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("the course is not registered");
        }

        // if (file.getContentType().toLowerCase() != "pdf" &&
        // file.getContentType().toLowerCase() != "ppt" &&
        // file.getContentType().toLowerCase() != "mp4"){
        // throw new IllegalArgumentException("Only PDF, PPT, and MP4 file types are
        // allowed.");
        // }
        Course course = courseRepository.findById(courseId).get();

        Ressource ressource = new Ressource();
        ressource.setCourse(course);
        ressource.setFilename(file.getOriginalFilename());
        ressource.setFilepath(uploadDir + "/courses/" + file.getOriginalFilename());
        ressource.setFiletype(file.getContentType());
        ressource.setTitle(title);

        saveRessourcesImpl.SaveRessource(file, title);

        ressourceRepository.save(ressource);

        return RessourceResponse.builder()
                .filename(file.getOriginalFilename())
                .filepath("/uploads/courses/" + file.getOriginalFilename())
                .filetype(file.getContentType())
                .title(title)
                .courseId(courseId)
                .build();
    }

    @Override
    public void delete(Long id) {
        if (!ressourceRepository.existsById(id)) {
            throw new IllegalArgumentException("the course is not registered");
        }
        ressourceRepository.deleteById(id);
    }

    @Override
    public List<RessourceResponse> getRessourceByCourse(Student student, Long courseId) {
        if (!student.isValidated()) {
            throw new AccessDeniedException("Profil étudiant non validé");
        }
        if (!courseRepository.existsById(courseId)) {
            throw new IllegalArgumentException("Course : " + courseId + " not found");
        }
        Course course = courseRepository.findById(courseId).get();
        List<Ressource> ressources = ressourceRepository.findByCourse(course);
        return ressources.stream()
                .map(e -> RessourceResponse.builder()
                        .Id(e.getId())
                        .courseId(e.getCourse().getId())
                        .filename(e.getFilename())
                        .filepath(e.getFilepath())
                        .filetype(e.getFiletype())
                        .title(e.getTitle())
                        .uploadedAt(e.getUploadedAt())
                        .build()).toList();

    }

    @Override
    public ResponseEntity<UrlResource> download(Long id){
        Ressource ressource = ressourceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ressource not found"));

        Path path = Paths.get(ressource.getFilepath());

        if (!Files.exists(path)) {
            throw new RuntimeException("File not found on disk");
        }

        UrlResource fileResource;
        try {
            fileResource = new UrlResource(path.toUri());
        } catch (MalformedURLException e) {
            throw new RuntimeException("Invalid file path");
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(ressource.getFiletype()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + ressource.getFilename() + "\"")
                .body(fileResource);
    }

}
