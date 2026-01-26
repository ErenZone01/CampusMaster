package com.campusmaster.campusmaster.infrastructure.persistence.course;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;

public interface CourseJpaRepository extends JpaRepository<Course, Long>, CourseRepository {
    // Tous les cours d’un module
    List<Course> findByModule(Module module);

    // Tous les cours enseignés par un prof
    List<Course> findByTeacher(Teacher teacher);

    // Sauvegarder un cours
    Course save(Course course);
}