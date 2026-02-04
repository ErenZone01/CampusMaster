package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.dto.UpdateCourseRequest;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CourseService {
    CourseResponse createCourse(CreateCourseRequest request);

    CourseResponse updateCourse(Long id, UpdateCourseRequest request);

    CourseResponse getCourseById(Long id);

    Page<CourseResponse> getAllCourses(
            Long teacherId,
            Long departmentId,
            Long semesterId,
            CourseStatus status,
            Pageable pageable);

    List<CourseResponse> getCoursesByTeacher(Long teacherId);

    List<CourseResponse> getMyCourses();

    void deleteCourse(Long id);
}
