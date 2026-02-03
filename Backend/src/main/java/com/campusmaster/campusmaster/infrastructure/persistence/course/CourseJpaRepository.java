package com.campusmaster.campusmaster.infrastructure.persistence.course;

import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CourseJpaRepository extends CourseRepository {
    // Hérite de toutes les méthodes de CourseRepository qui extend déjà JpaRepository
}
