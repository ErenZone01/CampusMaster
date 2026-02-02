package com.campusmaster.campusmaster.infrastructure.persistence.assignment;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.repository.AssignmentRepository;

public interface AssignmenJpatRepository extends JpaRepository<Assignment, Long>, AssignmentRepository {
    List<Assignment> findByCourseId(Long courseId);
    Assignment save(Assignment assignment);
    Optional<Assignment> findById(Long id);

}
