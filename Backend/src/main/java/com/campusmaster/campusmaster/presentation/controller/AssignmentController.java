package com.campusmaster.campusmaster.presentation.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CreateAssignmentRequest;
import com.campusmaster.campusmaster.application.service.AssignmentService;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Assignments", description = "Gestion des devoirs")
@SecurityRequirement(name = "Bearer Authentication")
public class AssignmentController {

    private final AssignmentService assignmentService;

    @PostMapping("/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Créer un devoir", description = "Permet à un enseignant de créer un nouveau devoir")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @Valid @RequestBody CreateAssignmentRequest request,
            @AuthenticationPrincipal Teacher teacher) {
        AssignmentResponse assignment = assignmentService.createAssignment(request, teacher.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(assignment);
    }

    @GetMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Détails d'un devoir", description = "Récupère les détails d'un devoir")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        AssignmentResponse assignment = assignmentService.getAssignmentById(id);
        return ResponseEntity.ok(assignment);
    }

    @GetMapping("/courses/{courseId}/assignments")
    @PreAuthorize("hasAnyRole('TEACHER', 'STUDENT', 'ADMIN')")
    @Operation(summary = "Devoirs d'un cours", description = "Récupère tous les devoirs d'un cours")
    public ResponseEntity<List<AssignmentResponse>> getAssignmentsByCourse(@PathVariable Long courseId) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByCourse(courseId);
        return ResponseEntity.ok(assignments);
    }

    @GetMapping("/teacher/assignments")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Mes devoirs", description = "Récupère tous les devoirs créés par l'enseignant connecté")
    public ResponseEntity<List<AssignmentResponse>> getMyAssignments(
            @AuthenticationPrincipal Teacher teacher) {
        List<AssignmentResponse> assignments = assignmentService.getAssignmentsByTeacher(teacher.getId());
        return ResponseEntity.ok(assignments);
    }

    @DeleteMapping("/assignments/{id}")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Supprimer un devoir", description = "Supprime un devoir")
    public ResponseEntity<Void> deleteAssignment(@PathVariable Long id) {
        assignmentService.deleteAssignment(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/teacher/assignments/count")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Nombre de devoirs", description = "Compte le nombre total de devoirs créés par l'enseignant")
    public ResponseEntity<Long> countMyAssignments(@AuthenticationPrincipal Teacher teacher) {
        Long count = assignmentService.countAssignmentsByTeacher(teacher.getId());
        return ResponseEntity.ok(count);
    }
}
