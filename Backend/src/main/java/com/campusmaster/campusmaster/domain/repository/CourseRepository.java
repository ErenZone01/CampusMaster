package com.campusmaster.campusmaster.domain.repository;

import java.util.List;

import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;

@Repository
public interface CourseRepository {
    // Tous les cours d’un module
    List<Course> findByModule(Module module);

    List<Course> findAll();

    // Tous les cours enseignés par un prof
    List<Course> findByTeacher(Teacher teacher);

    // Sauvegarder un cours
    Course save(Course course);
}