package com.campusmaster.campusmaster.infrastructure.persistence.submission;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.assigment.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long>{

}
