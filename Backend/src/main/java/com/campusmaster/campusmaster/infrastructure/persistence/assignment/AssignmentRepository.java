package com.campusmaster.campusmaster.infrastructure.persistence.assignment;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campusmaster.campusmaster.domain.model.assigment.Assignment;

public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    
    List<Assignment> findByCourseId(Long courseId);
    
    List<Assignment> findByTeacherId(Long teacherId);
    
    @Query("SELECT a FROM Assignment a WHERE a.teacher.id = :teacherId ORDER BY a.dueDate DESC")
    List<Assignment> findByTeacherIdOrderByDueDateDesc(@Param("teacherId") Long teacherId);
    
    @Query("SELECT COUNT(a) FROM Assignment a WHERE a.teacher.id = :teacherId")
    Long countByTeacherId(@Param("teacherId") Long teacherId);
}
