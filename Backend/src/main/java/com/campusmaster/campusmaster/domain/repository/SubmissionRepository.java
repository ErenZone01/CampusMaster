package com.campusmaster.campusmaster.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.assigment.Submission;

@Repository
public interface SubmissionRepository {
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<Submission> findByAssignmentId(Long assignmentId);

    List<Submission> findByStudentId(Long studentId);

    Optional<Submission> findById(Long id);

    Submission save(Submission submission);
}
