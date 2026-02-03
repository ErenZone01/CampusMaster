package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import com.campusmaster.campusmaster.domain.model.user.Student;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/student")
@Tag(name = "Student", description = "Endpoints pour les étudiants")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class StudentController {

    private final CourseService courseService;

    @GetMapping("/courses")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Mes cours disponibles",
            description = "Liste des cours du département de l'étudiant")
    public ResponseEntity<Page<CourseResponse>> getAvailableCourses(
            @AuthenticationPrincipal Student student,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<CourseResponse> courses =
                courseService.getAllCourses(
                        null,
                        student.getDepartment().getId(),
                        null,
                        CourseStatus.PUBLISHED,
                        pageable);
        return ResponseEntity.ok(courses);
    }

    @GetMapping("/courses/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Détails d'un cours", description = "Voir les détails d'un cours")
    public ResponseEntity<CourseResponse> getCourseDetails(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(course);
    }
}
