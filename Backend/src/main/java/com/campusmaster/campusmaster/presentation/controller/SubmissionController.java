package com.campusmaster.campusmaster.presentation.controller;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.FileStorageService;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Submissions", description = "Gestion des soumissions de devoirs")
@SecurityRequirement(name = "Bearer Authentication")
public class SubmissionController {

    private final SubmissionService submissionService;
    private final FileStorageService fileStorageService;

    @PostMapping("/assignments/{assignmentId}/submit")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Soumettre un devoir",
            description = "Permet à un étudiant de soumettre un devoir")
    public ResponseEntity<SubmissionResponse> submitAssignment(
            @PathVariable Long assignmentId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Student student) {

        // Upload du fichier
        String filePath = fileStorageService.storeFile(file, "submissions");

        // Créer la soumission
        SubmissionResponse submission =
                submissionService.createSubmission(assignmentId, student.getId(), filePath);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignments/{assignmentId}/my-submission")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Ma soumission",
            description = "Récupère la soumission de l'étudiant pour un devoir")
    public ResponseEntity<SubmissionResponse> getMySubmissionForAssignment(
            @PathVariable Long assignmentId, @AuthenticationPrincipal Student student) {
        SubmissionResponse submission =
                submissionService.getMySubmissionForAssignment(assignmentId, student.getId());
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/submissions/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TEACHER', 'ADMIN')")
    @Operation(
            summary = "Détail d'une soumission",
            description = "Récupère les détails d'une soumission")
    public ResponseEntity<SubmissionResponse> getSubmissionById(@PathVariable Long id) {
        SubmissionResponse submission = submissionService.getSubmissionById(id);
        return ResponseEntity.ok(submission);
    }

    @GetMapping("/assignments/{assignmentId}/submissions")
    @PreAuthorize("hasAnyRole('TEACHER', 'ADMIN')")
    @Operation(
            summary = "Soumissions d'un devoir",
            description = "Récupère toutes les soumissions d'un devoir")
    public ResponseEntity<List<SubmissionResponse>> getSubmissionsByAssignment(
            @PathVariable Long assignmentId) {
        List<SubmissionResponse> submissions =
                submissionService.getSubmissionsByAssignment(assignmentId);
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/student/submissions")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Mes soumissions",
            description = "Récupère toutes les soumissions de l'étudiant connecté")
    public ResponseEntity<List<SubmissionResponse>> getMySubmissions(
            @AuthenticationPrincipal Student student) {
        List<SubmissionResponse> submissions =
                submissionService.getSubmissionsByStudent(student.getId());
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/teacher/submissions/pending")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
            summary = "Soumissions en attente",
            description = "Récupère toutes les soumissions en attente de correction")
    public ResponseEntity<List<SubmissionResponse>> getPendingSubmissions(
            @AuthenticationPrincipal Teacher teacher) {
        List<SubmissionResponse> submissions =
                submissionService.getPendingSubmissionsByTeacher(teacher.getId());
        return ResponseEntity.ok(submissions);
    }

    @GetMapping("/teacher/submissions/pending/count")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
            summary = "Nombre de soumissions en attente",
            description = "Compte le nombre de soumissions en attente de correction")
    public ResponseEntity<Long> countPendingSubmissions(@AuthenticationPrincipal Teacher teacher) {
        Long count = submissionService.countPendingSubmissionsByTeacher(teacher.getId());
        return ResponseEntity.ok(count);
    }

    @PostMapping("/submissions/{id}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    @Operation(
            summary = "Noter une soumission",
            description = "Permet à un enseignant de noter une soumission")
    public ResponseEntity<SubmissionResponse> gradeSubmission(
            @PathVariable Long id,
            @RequestParam Double grade,
            @RequestParam(required = false) String feedback) {
        SubmissionResponse submission = submissionService.gradeSubmission(id, grade, feedback);
        return ResponseEntity.ok(submission);
    }

    @PutMapping("/submissions/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Modifier une soumission",
            description =
                    "Permet à un étudiant de modifier sa soumission (si non notée et date non dépassée)")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal Student student) {

        // Upload du nouveau fichier
        String filePath = fileStorageService.storeFile(file, "submissions");

        // Modifier la soumission
        SubmissionResponse submission =
                submissionService.updateSubmission(id, student.getId(), filePath);
        return ResponseEntity.ok(submission);
    }

    @DeleteMapping("/submissions/{id}")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Supprimer une soumission",
            description =
                    "Permet à un étudiant de supprimer sa soumission (si non notée et date non dépassée)")
    public ResponseEntity<Void> deleteSubmission(
            @PathVariable Long id, @AuthenticationPrincipal Student student) {
        submissionService.deleteSubmission(id, student.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/submissions/{id}/can-modify")
    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Vérifier si modifiable",
            description = "Vérifie si une soumission peut être modifiée ou supprimée")
    public ResponseEntity<Boolean> canModifySubmission(
            @PathVariable Long id, @AuthenticationPrincipal Student student) {
        boolean canModify = submissionService.canModifySubmission(id, student.getId());
        return ResponseEntity.ok(canModify);
    }
}
