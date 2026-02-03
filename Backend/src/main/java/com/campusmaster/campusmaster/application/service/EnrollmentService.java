package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.EnrollmentResponse;
import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(Long courseId, Long studentId);

    void unenrollStudent(Long courseId, Long studentId);

    List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId);

    List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId);

    boolean isStudentEnrolled(Long courseId, Long studentId);
}
