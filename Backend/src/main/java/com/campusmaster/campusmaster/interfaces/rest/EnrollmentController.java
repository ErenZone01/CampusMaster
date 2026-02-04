package com.campusmaster.campusmaster.interfaces.rest;

import com.campusmaster.campusmaster.application.dto.EnrollmentResponse;
import com.campusmaster.campusmaster.application.service.EnrollmentService;
import com.campusmaster.campusmaster.domain.model.user.Student;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Enrollment", description = "Gestion des inscriptions aux cours")
@SecurityRequirement(name = "bearer-jwt")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    @PostMapping("/courses/{courseId}/enroll")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "S'inscrire à un cours",
            description = "Permet à un étudiant de s'inscrire à un cours")
    public ResponseEntity<EnrollmentResponse> enrollStudent(
            @PathVariable Long courseId, @AuthenticationPrincipal Student currentUser) {
        EnrollmentResponse enrollment =
                enrollmentService.enrollStudent(courseId, currentUser.getId());
        return ResponseEntity.ok(enrollment);
    }

    @DeleteMapping("/courses/{courseId}/unenroll")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Se désinscrire d'un cours",
            description = "Permet à un étudiant de se désinscrire d'un cours")
    public ResponseEntity<Void> unenrollStudent(
            @PathVariable Long courseId, @AuthenticationPrincipal Student currentUser) {
        enrollmentService.unenrollStudent(courseId, currentUser.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses/{courseId}/students")
    @PreAuthorize("hasAnyRole('ADMIN', 'TEACHER')")
    @Operation(
            summary = "Liste des étudiants inscrits",
            description = "Récupère la liste des étudiants inscrits à un cours")
    public ResponseEntity<List<EnrollmentResponse>> getCourseEnrollments(
            @PathVariable Long courseId) {
        List<EnrollmentResponse> enrollments = enrollmentService.getEnrollmentsByCourse(courseId);
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/student/enrollments")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Mes inscriptions",
            description = "Récupère la liste des cours auxquels l'étudiant est inscrit")
    public ResponseEntity<List<EnrollmentResponse>> getMyEnrollments(
            @AuthenticationPrincipal Student currentUser) {
        List<EnrollmentResponse> enrollments =
                enrollmentService.getEnrollmentsByStudent(currentUser.getId());
        return ResponseEntity.ok(enrollments);
    }

    @GetMapping("/courses/{courseId}/enrollment-status")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Vérifier inscription",
            description = "Vérifie si l'étudiant est inscrit à un cours")
    public ResponseEntity<Boolean> checkEnrollmentStatus(
            @PathVariable Long courseId, @AuthenticationPrincipal Student currentUser) {
        boolean isEnrolled = enrollmentService.isStudentEnrolled(courseId, currentUser.getId());
        return ResponseEntity.ok(isEnrolled);
    }
}
