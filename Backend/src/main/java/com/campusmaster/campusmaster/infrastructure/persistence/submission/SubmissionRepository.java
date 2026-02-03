package com.campusmaster.campusmaster.infrastructure.persistence.submission;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.campusmaster.campusmaster.domain.model.assigment.Submission;

public interface SubmissionRepository extends JpaRepository<Submission, Long> {
    
    List<Submission> findByAssignmentId(Long assignmentId);
    
    List<Submission> findByStudentId(Long studentId);
    
    Optional<Submission> findByAssignmentIdAndStudentId(Long assignmentId, Long studentId);
    
    @Query("SELECT s FROM Submission s WHERE s.assignment.teacher.id = :teacherId AND s.grade IS NULL ORDER BY s.submittedAt DESC")
    List<Submission> findPendingSubmissionsByTeacher(@Param("teacherId") Long teacherId);
    
    @Query("SELECT COUNT(s) FROM Submission s WHERE s.assignment.teacher.id = :teacherId AND s.grade IS NULL")
    Long countPendingSubmissionsByTeacher(@Param("teacherId") Long teacherId);
    
    @Query("SELECT s FROM Submission s WHERE s.assignment.course.id = :courseId")
    List<Submission> findByCourseId(@Param("courseId") Long courseId);
}
