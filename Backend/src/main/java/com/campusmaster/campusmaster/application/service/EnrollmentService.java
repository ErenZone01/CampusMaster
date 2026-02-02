package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.EnrollmentResponse;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(Long courseId, Long studentId);
    
    void unenrollStudent(Long courseId, Long studentId);
    
    List<EnrollmentResponse> getEnrollmentsByCourse(Long courseId);
    
    List<EnrollmentResponse> getEnrollmentsByStudent(Long studentId);
    
    boolean isStudentEnrolled(Long courseId, Long studentId);
}
