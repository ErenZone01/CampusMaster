package com.campusmaster.campusmaster.domain.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findByTeacher(Teacher teacher);
    
    List<Course> findByDepartment(Department department);
    
    List<Course> findBySemester(AcademicSemester semester);
    
    List<Course> findByStatus(CourseStatus status);
    
    Optional<Course> findByCode(String code);
    
    boolean existsByCode(String code);
    
    @Query("SELECT c FROM Course c WHERE " +
           "(:teacherId IS NULL OR c.teacher.id = :teacherId) AND " +
           "(:departmentId IS NULL OR c.department.id = :departmentId) AND " +
           "(:semesterId IS NULL OR c.semester.id = :semesterId) AND " +
           "(:status IS NULL OR c.status = :status)")
    Page<Course> findByFilters(
        @Param("teacherId") Long teacherId,
        @Param("departmentId") Long departmentId,
        @Param("semesterId") Long semesterId,
        @Param("status") CourseStatus status,
        Pageable pageable
    );
}
