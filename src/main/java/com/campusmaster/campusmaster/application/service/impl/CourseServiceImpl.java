package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.ModuleRepository;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;

import lombok.AllArgsConstructor;

import com.campusmaster.campusmaster.domain.model.pedagogy.Module;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
@AllArgsConstructor
public class CourseServiceImpl implements CourseService {

    @Autowired
    private CourseRepository courseRepository;
    @Autowired
    private ModuleRepository moduleRepository;
    @Autowired
    private TeacherRepository teacherRepository;

    @Override
    public Course createCourse(CreateCourseRequest request) {
        if (moduleRepository.findById(request.getModuleId()).isEmpty()) {
            throw new IllegalArgumentException("Module not found with id: " + request.getModuleId());
        }
        if (teacherRepository.findById(request.getTeacherId()).isEmpty()) {
            throw new IllegalArgumentException("Teacher not found with id: " + request.getTeacherId());
        }

        Module module = moduleRepository.findById(request.getModuleId()).get();
        Teacher teacher = teacherRepository.findById(request.getTeacherId()).get();

        module.getTeachers().add(teacher);
        

        Course course = Course.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .module(module)
                .teacher(teacher)
                .build();
        courseRepository.save(course);
        moduleRepository.save(module);
        return course;
    }

    @Override
    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    @Override
    public List<Course> getCoursesBySemester(Semester semester) {
        throw new UnsupportedOperationException("Unimplemented method 'getCoursesBySemester'");
    }

    @Override
    public List<Course> getCoursesByModule(Long moduleId) {
        return courseRepository.findByModule(moduleRepository.findById(moduleId).get());
    }

    @Override
    public List<Course> getCoursesByTeacher(Long teacherId) {
        return courseRepository.findByTeacher(teacherRepository.findById(teacherId).get());
    }
    
}
