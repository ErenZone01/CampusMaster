package com.campusmaster.campusmaster.infrastructure.persistence.assignment;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.assigment.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {

}
