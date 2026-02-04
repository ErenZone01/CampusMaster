package com.campusmaster.campusmaster.application.service.impl;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.assigment.Submission;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;
import com.campusmaster.campusmaster.infrastructure.persistence.assignment.AssignmentRepository;
import com.campusmaster.campusmaster.infrastructure.persistence.submission.SubmissionRepository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;

    @Override
    public SubmissionResponse createSubmission(Long assignmentId, Long studentId, String filePath) {
        // Vérifier si une soumission existe déjà
        Optional<Submission> existingSubmission =
                submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
        if (existingSubmission.isPresent()) {
            throw new RuntimeException("Vous avez déjà soumis ce devoir");
        }

        Assignment assignment =
                assignmentRepository
                        .findById(assignmentId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Devoir non trouvé avec l'id: " + assignmentId));

        Student student =
                studentRepository
                        .findById(studentId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Étudiant non trouvé avec l'id: " + studentId));

        Submission submission =
                Submission.builder()
                        .assignment(assignment)
                        .student(student)
                        .filePath(filePath)
                        .submittedAt(LocalDateTime.now())
                        .grade(null)
                        .feedback(null)
                        .build();

        Submission saved = submissionRepository.save(submission);
        return SubmissionResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getSubmissionById(Long submissionId) {
        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Soumission non trouvée avec l'id: "
                                                        + submissionId));
        return SubmissionResponse.fromEntity(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionResponse getMySubmissionForAssignment(Long assignmentId, Long studentId) {
        Optional<Submission> submission =
                submissionRepository.findByAssignmentIdAndStudentId(assignmentId, studentId);
        return submission.map(SubmissionResponse::fromEntity).orElse(null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream()
                .map(SubmissionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getSubmissionsByStudent(Long studentId) {
        List<Submission> submissions = submissionRepository.findByStudentId(studentId);
        return submissions.stream()
                .map(SubmissionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionResponse> getPendingSubmissionsByTeacher(Long teacherId) {
        List<Submission> submissions =
                submissionRepository.findPendingSubmissionsByTeacher(teacherId);
        return submissions.stream()
                .map(SubmissionResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public Long countPendingSubmissionsByTeacher(Long teacherId) {
        return submissionRepository.countPendingSubmissionsByTeacher(teacherId);
    }

    @Override
    public SubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback) {
        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Soumission non trouvée avec l'id: "
                                                        + submissionId));

        submission.setGrade(grade);
        submission.setFeedback(feedback);

        Submission updated = submissionRepository.save(submission);
        return SubmissionResponse.fromEntity(updated);
    }

    @Override
    public SubmissionResponse updateSubmission(
            Long submissionId, Long studentId, String newFilePath) {
        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Soumission non trouvée avec l'id: "
                                                        + submissionId));

        // Vérifier que c'est bien l'étudiant propriétaire
        if (!submission.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à modifier cette soumission");
        }

        // Vérifier que la soumission peut être modifiée
        if (!canModifySubmission(submissionId, studentId)) {
            throw new RuntimeException("Cette soumission ne peut plus être modifiée");
        }

        submission.setFilePath(newFilePath);

        Submission updated = submissionRepository.save(submission);
        return SubmissionResponse.fromEntity(updated);
    }

    @Override
    public void deleteSubmission(Long submissionId, Long studentId) {
        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Soumission non trouvée avec l'id: "
                                                        + submissionId));

        // Vérifier que c'est bien l'étudiant propriétaire
        if (!submission.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("Vous n'êtes pas autorisé à supprimer cette soumission");
        }

        // Vérifier que la soumission peut être supprimée
        if (!canModifySubmission(submissionId, studentId)) {
            throw new RuntimeException("Cette soumission ne peut plus être supprimée");
        }

        submissionRepository.delete(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean canModifySubmission(Long submissionId, Long studentId) {
        Submission submission =
                submissionRepository
                        .findById(submissionId)
                        .orElseThrow(
                                () ->
                                        new RuntimeException(
                                                "Soumission non trouvée avec l'id: "
                                                        + submissionId));

        // Vérifier que c'est bien l'étudiant propriétaire
        if (!submission.getStudent().getId().equals(studentId)) {
            return false;
        }

        // Ne peut pas modifier si déjà noté
        if (submission.getGrade() != null) {
            return false;
        }

        // Ne peut pas modifier si la date limite est dépassée
        if (submission.getAssignment().getDueDate().isBefore(java.time.LocalDateTime.now())) {
            return false;
        }

        return true;
    }
}
