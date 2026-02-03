package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.assigment.Submission;
import com.campusmaster.campusmaster.infrastructure.persistence.submission.SubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;

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
        List<Submission> submissions = submissionRepository.findPendingSubmissionsByTeacher(teacherId);
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
        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Soumission non trouvée avec l'id: " + submissionId));
        
        submission.setGrade(grade);
        submission.setFeedback(feedback);
        
        Submission updated = submissionRepository.save(submission);
        return SubmissionResponse.fromEntity(updated);
    }
}
