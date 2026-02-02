package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

public interface CourseService {

    List<CourseResponse> getCoursesByTeacher(Teacher teacher, Long moduleId);

    List<Course> getCoursesBySemester(Semester semester);

    List<Course> getCoursesByModule(Long moduleId);

    List<Course> getCoursesByTeacher(Long teacherId);

    CourseResponse createCourse(CreateCourseRequest request);

    List<CourseResponse> getCoursesByModule(Student student, Long moduleId);


}
