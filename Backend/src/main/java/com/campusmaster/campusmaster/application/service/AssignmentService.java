package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CreateAssignmentRequest;

public interface AssignmentService {
    
    AssignmentResponse createAssignment(CreateAssignmentRequest request, Long teacherId);
    
    AssignmentResponse getAssignmentById(Long id);
    
    List<AssignmentResponse> getAssignmentsByCourse(Long courseId);
    
    List<AssignmentResponse> getAssignmentsByTeacher(Long teacherId);
    
    void deleteAssignment(Long id);
    
    Long countAssignmentsByTeacher(Long teacherId);
}
