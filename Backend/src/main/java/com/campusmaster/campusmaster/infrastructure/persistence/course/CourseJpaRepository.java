package com.campusmaster.campusmaster.infrastructure.persistence.course;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.repository.CourseRepository;

@Repository
public interface CourseJpaRepository extends CourseRepository {
    // Hérite de toutes les méthodes de CourseRepository qui extend déjà JpaRepository
}