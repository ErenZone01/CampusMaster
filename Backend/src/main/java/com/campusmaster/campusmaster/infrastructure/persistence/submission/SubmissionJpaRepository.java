package com.campusmaster.campusmaster.infrastructure.persistence.submission;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.assigment.Submission;
import com.campusmaster.campusmaster.domain.repository.SubmissionRepository;

public interface SubmissionJpaRepository extends JpaRepository<Submission, Long>, SubmissionRepository{
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);

    List<Submission> findByAssignmentId(Long assignmentId);

    List<Submission> findByStudentId(Long studentId);
}
