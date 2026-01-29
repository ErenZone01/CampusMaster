package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Student;

public interface CourseService {
    CourseResponse createCourse(CreateCourseRequest request);

    List<CourseResponse> getAllCourses(Student student);

    List<Course> getCoursesBySemester(Semester semester);

    List<Course> getCoursesByModule(Long moduleId);

    List<Course> getCoursesByTeacher(Long teacherId);
}
