package com.campusmaster.campusmaster.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.ressource.Ressource;

@Repository
public interface RessourceRepository {
    Ressource save(Ressource ressource);
    Optional<Ressource> findById(Long id);
    void deleteById(Long id);
    boolean existsById(Long id);
    List<Ressource> findByCourse(Course course);
}
