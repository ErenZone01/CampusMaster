package com.campusmaster.campusmaster.presentation.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Gestion des soumissions de devoirs")
@SecurityRequirement(name = "Bearer Authentication")
public class SubmissionController {

    private final SubmissionService submissionService;

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(summary = "Soumissions d'un devoir", description = "Récupère toutes les soumissions d'un devoir")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(@PathVariable Long assignmentId) {
        List<SubmissionResponse> submissions = submissionService.getSubmissionsByAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(summary = "Mes soumissions", description = "Récupère toutes les soumissions de l'étudiant connecté")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(@AuthenticationPrincipal Student student) {
        List<SubmissionResponse> submissions = submissionService.getSubmissionsByStudent(student.getId());
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/teacher/submissions/pending")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Soumissions en attente", description = "Récupère toutes les soumissions en attente de correction")
    public ResponseEntity<List<SubmissionResponse>> getPendingSubmissions(@AuthenticationPrincipal Teacher teacher) {
        List<SubmissionResponse> submissions = submissionService.getPendingSubmissionsByTeacher(teacher.getId());
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/teacher/submissions/pending/count")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Nombre de soumissions en attente", description = "Compte le nombre de soumissions en attente de correction")
    public ResponseEntity<Long> countPendingSubmissions(@AuthenticationPrincipal Teacher teacher) {
        Long count = submissionService.countPendingSubmissionsByTeacher(teacher.getId());
        return ResponseEntity.ok(count);
    }

    @PostMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(summary = "Noter une soumission", description = "Permet à un enseignant de noter une soumission")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Double grade,
            @RequestParam(required = false) String feedback) {
        SubmissionResponse submission = submissionService.gradeSubmission(id, grade, feedback);
        return ResponseEntity.ok(submission);
    }
}
