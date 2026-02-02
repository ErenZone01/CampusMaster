package com.campusmaster.campusmaster.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.assigment.Assignment;

@Repository
public interface AssignmentRepository {
    List<Assignment> findByCourseId(Long courseId);
    Assignment save(Assignment assignment);
    Optional<Assignment> findById(Long id);
}
