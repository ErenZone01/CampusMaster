package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.dto.UpdateCourseRequest;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.application.service.FileStorageService;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/courses")
@Tag(name = "Courses", description = "Gestion des cours")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;
    private final FileStorageService fileStorageService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(
            summary = "Liste des cours",
            description = "Récupérer tous les cours avec filtres optionnels")
    public ResponseEntity<Page<CourseResponse>> getAllCourses(
            @RequestParam(required = false) Long teacherId,
            @RequestParam(required = false) Long departmentId,
            @RequestParam(required = false) Long semesterId,
            @RequestParam(required = false) CourseStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {

        Sort sort =
                sortDir.equalsIgnoreCase("ASC")
                        ? Sort.by(sortBy).ascending()
                        : Sort.by(sortBy).descending();

        Pageable pageable = PageRequest.of(page, size, sort);
        Page<CourseResponse> courses =
                courseService.getAllCourses(teacherId, departmentId, semesterId, status, pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER', 'STUDENT')")
    @Operation(summary = "Détails d'un cours", description = "Récupérer un cours par son ID")
    public ResponseEntity<CourseResponse> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Créer un cours", description = "Créer un nouveau cours")
    public ResponseEntity<CourseResponse> createCourse(
            @Valid @RequestBody CreateCourseRequest request) {
        CourseResponse course = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(course);
    }

    @PostMapping(value = "/{id}/cover", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(
            summary = "Upload cover image",
            description = "Uploader une image de couverture pour un cours")
    public ResponseEntity<CourseResponse> uploadCoverImage(
            @PathVariable Long id, @RequestPart("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        String allowedTypes = "image/jpeg,image/png,image/jpg,image/webp";
        if (!allowedTypes.contains(file.getContentType())) {
            throw new IllegalArgumentException(
                    "Type de fichier non autorisé. Formats acceptés: JPG, PNG, WEBP");
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException("La taille du fichier ne doit pas dépasser 5MB");
        }

        String filename = fileStorageService.storeFile(file, "courses");
        String fileUrl = fileStorageService.getFileUrl(filename);

        UpdateCourseRequest updateRequest =
                UpdateCourseRequest.builder().coverImage(fileUrl).build();

        CourseResponse updatedCourse = courseService.updateCourse(id, updateRequest);
        return ResponseEntity.ok(updatedCourse);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Modifier un cours", description = "Modifier un cours existant")
    public ResponseEntity<CourseResponse> updateCourse(
            @PathVariable Long id, @Valid @RequestBody UpdateCourseRequest request) {
        CourseResponse course = courseService.updateCourse(id, request);
        return ResponseEntity.ok(course);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(summary = "Supprimer un cours", description = "Supprimer un cours")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id) {
        courseService.deleteCourse(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teacher/{teacherId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(
            summary = "Cours d'un enseignant",
            description = "Récupérer tous les cours d'un enseignant")
    public ResponseEntity<?> getCoursesByTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(courseService.getCoursesByTeacher(teacherId));
    }

    @GetMapping("/my-courses")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Mes cours", description = "Récupérer les cours du professeur connecté")
    public ResponseEntity<?> getMyCourses() {
        return ResponseEntity.ok(courseService.getMyCourses());
    }
}
