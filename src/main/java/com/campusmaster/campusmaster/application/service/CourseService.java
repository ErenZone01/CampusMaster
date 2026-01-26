package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;

public interface CourseService {
    Course createCourse(CreateCourseRequest request);

    List<Course> getAllCourses();

    List<Course> getCoursesBySemester(Semester semester);

    List<Course> getCoursesByModule(Long moduleId);

    List<Course> getCoursesByTeacher(Long teacherId);
}
