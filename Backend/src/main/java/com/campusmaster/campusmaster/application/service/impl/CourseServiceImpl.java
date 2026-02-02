package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.dto.UpdateCourseRequest;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.CourseStatus;
import com.campusmaster.campusmaster.domain.model.pedagogy.AcademicSemester;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.AcademicSemesterRepository;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.DepartmentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final AcademicSemesterRepository semesterRepository;
    private final UserRepository userRepository;

    @Override
    public CourseResponse createCourse(CreateCourseRequest request) {
        Department department = departmentRepository.findById(request.getDepartmentId())
                .orElseThrow(() -> new IllegalArgumentException("Département non trouvé"));

        AcademicSemester semester = semesterRepository.findById(request.getSemesterId())
                .orElseThrow(() -> new IllegalArgumentException("Semestre non trouvé"));

        Teacher teacher = (Teacher) userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Enseignant non trouvé"));

        if (courseRepository.existsByCode(request.getCode())) {
            throw new IllegalStateException("Un cours avec ce code existe déjà");
        }

        Course course = Course.builder()
                .code(request.getCode())
                .title(request.getTitle())
                .description(request.getDescription())
                .credits(request.getCredits())
                .maxStudents(request.getMaxStudents())
                .coverImage(request.getCoverImage())
                .status(request.getStatus() != null ? request.getStatus() : CourseStatus.DRAFT)
                .department(department)
                .semester(semester)
                .teacher(teacher)
                .build();

        Course savedCourse = courseRepository.save(course);
        return CourseResponse.fromEntity(savedCourse);
    }

    @Override
    public CourseResponse updateCourse(Long id, UpdateCourseRequest request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));

        if (request.getCode() != null && !request.getCode().equals(course.getCode())) {
            if (courseRepository.existsByCode(request.getCode())) {
                throw new IllegalStateException("Un cours avec ce code existe déjà");
            }
            course.setCode(request.getCode());
        }

        if (request.getTitle() != null) {
            course.setTitle(request.getTitle());
        }

        if (request.getDescription() != null) {
            course.setDescription(request.getDescription());
        }

        if (request.getCredits() != null) {
            course.setCredits(request.getCredits());
        }

        if (request.getMaxStudents() != null) {
            course.setMaxStudents(request.getMaxStudents());
        }

        if (request.getCoverImage() != null) {
            course.setCoverImage(request.getCoverImage());
        }

        if (request.getStatus() != null) {
            course.setStatus(request.getStatus());
        }

        if (request.getDepartmentId() != null) {
            Department department = departmentRepository.findById(request.getDepartmentId())
                    .orElseThrow(() -> new IllegalArgumentException("Département non trouvé"));
            course.setDepartment(department);
        }

        if (request.getSemesterId() != null) {
            AcademicSemester semester = semesterRepository.findById(request.getSemesterId())
                    .orElseThrow(() -> new IllegalArgumentException("Semestre non trouvé"));
            course.setSemester(semester);
        }

        if (request.getTeacherId() != null) {
            Teacher teacher = (Teacher) userRepository.findById(request.getTeacherId())
                    .orElseThrow(() -> new IllegalArgumentException("Enseignant non trouvé"));
            course.setTeacher(teacher);
        }

        Course updatedCourse = courseRepository.save(course);
        return CourseResponse.fromEntity(updatedCourse);
    }

    @Override
    public CourseResponse getCourseById(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));
        return CourseResponse.fromEntity(course);
    }

    @Override
    public Page<CourseResponse> getAllCourses(Long teacherId, Long departmentId, Long semesterId, 
                                               CourseStatus status, Pageable pageable) {
        Page<Course> courses = courseRepository.findByFilters(teacherId, departmentId, semesterId, status, pageable);
        return courses.map(CourseResponse::fromEntity);
    }

    @Override
    public List<CourseResponse> getCoursesByTeacher(Long teacherId) {
        Teacher teacher = (Teacher) userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Enseignant non trouvé"));
        List<Course> courses = courseRepository.findByTeacher(teacher);
        return courses.stream()
                .map(CourseResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));
        courseRepository.delete(course);
    }
}
