package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.campusmaster.campusmaster.application.dto.EnrollmentResponse;
import com.campusmaster.campusmaster.application.service.EnrollmentService;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.course.Enrollment;
import com.campusmaster.campusmaster.domain.model.course.EnrollmentStatus;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.EnrollmentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

import lombok.RequiredArgsConstructor;

@Service
@Transactional
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    @Override
    public EnrollmentResponse enrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));

        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé"));

        if (enrollmentRepository.existsByStudentAndCourse(student, course)) {
            throw new IllegalStateException("L'étudiant est déjà inscrit à ce cours");
        }

        if (course.getMaxStudents() != null) {
            long activeEnrollments = enrollmentRepository.countActiveEnrollmentsByCourse(course);
            if (activeEnrollments >= course.getMaxStudents()) {
                throw new IllegalStateException("Le cours a atteint sa capacité maximale");
            }
        }

        Enrollment enrollment = Enrollment.builder()
                .student(student)
                .course(course)
                .status(EnrollmentStatus.ACTIVE)
                .build();

        Enrollment savedEnrollment = enrollmentRepository.save(enrollment);
        return EnrollmentResponse.fromEntity(savedEnrollment);
    }

    @Override
    public void unenrollStudent(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));

        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé"));

        Enrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new IllegalArgumentException("Inscription non trouvée"));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.save(enrollment);
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));

        List<Enrollment> enrollments = enrollmentRepository.findByCourse(course);
        return enrollments.stream()
                .map(EnrollmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId) {
        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé"));

        List<Enrollment> enrollments = enrollmentRepository.findByStudent(student);
        return enrollments.stream()
                .map(EnrollmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public boolean isStudentEnrolled(Long courseId, Long studentId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Cours non trouvé"));

        Student student = (Student) userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Étudiant non trouvé"));

        return enrollmentRepository.existsByStudentAndCourse(student, course);
    }
}
