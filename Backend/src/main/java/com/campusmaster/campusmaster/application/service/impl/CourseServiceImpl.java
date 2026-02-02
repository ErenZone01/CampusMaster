package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.pedagogy.Semester;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.ModuleRepository;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;
import com.campusmaster.campusmaster.domain.model.pedagogy.Module;

import lombok.AllArgsConstructor;

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

    @Override
    public CourseResponse createCourse(CreateCourseRequest request) {
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
        Course saved = courseRepository.save(course);
        moduleRepository.save(module);
        return CourseResponse.builder()
                .id(saved.getId())
                .title(saved.getTitle())
                .description(saved.getDescription())
                .moduleId(saved.getModule() != null ? saved.getModule().getId() : null)
                .moduleName(saved.getModule() != null ? saved.getModule().getName() : null)
                .teacherId(saved.getTeacher() != null ? saved.getTeacher().getId() : null)
                .teacherFirstName(saved.getTeacher() != null ? saved.getTeacher().getFirstName() : null)
                .teacherLastName(saved.getTeacher() != null ? saved.getTeacher().getLastName() : null)
                .build();
    }

    @Override
    public List<CourseResponse> getCoursesByModule(Student student, Long moduleId) {
        if (!student.isValidated()) {
            throw new AccessDeniedException("Profil étudiant non validé");
        }
        if (moduleRepository.findById(moduleId) == null) {
            throw new IllegalArgumentException("Module : " + moduleId + " not found");
        }
        Module modules = moduleRepository.findById(moduleId).get();
        List<Course> courses = courseRepository.findByModule(modules);
        List<CourseResponse> resp = courses.stream().map(c -> CourseResponse.builder()
                .id(c.getId())
                .title(c.getTitle())
                .description(c.getDescription())
                .moduleId(c.getModule() != null ? c.getModule().getId() : null)
                .moduleName(c.getModule() != null ? c.getModule().getName() : null)
                .teacherId(c.getTeacher() != null ? c.getTeacher().getId() : null)
                .teacherFirstName(c.getTeacher() != null ? c.getTeacher().getFirstName() : null)
                .teacherLastName(c.getTeacher() != null ? c.getTeacher().getLastName() : null)
                .build()).toList();
        return resp;
    }

    @Override
    public List<CourseResponse> getCoursesByTeacher(Teacher teacher, Long moduleId) {
        if(moduleRepository.findById(moduleId) == null){
            throw new IllegalArgumentException("module doesn't exist");
        }

        Module module = moduleRepository.findByIdAndTeachers(moduleId, teacher);
        List<Course> course = courseRepository.findByModule(module);
        return course.stream().map(e -> CourseResponse.builder()
                .description(e.getDescription())
                .moduleId(e.getModule().getId())
                .moduleName(e.getModule().getName())
                .teacherFirstName(e.getTeacher().getFirstName())
                .teacherLastName(e.getTeacher().getLastName())
                .id(e.getId())
                .build()).toList();
    }

}
