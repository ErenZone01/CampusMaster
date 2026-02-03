package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CreateAssignmentRequest;
import com.campusmaster.campusmaster.application.dto.UpdateAssignmentRequest;
import java.util.List;

public interface AssignmentService {

    AssignmentResponse createAssignment(CreateAssignmentRequest request, Long teacherId);

    AssignmentResponse updateAssignment(Long id, UpdateAssignmentRequest request);

    AssignmentResponse getAssignmentById(Long id);

    List<AssignmentResponse> getAssignmentsByCourse(Long courseId);

    List<AssignmentResponse> getAssignmentsByTeacher(Long teacherId);

    void deleteAssignment(Long id);

    Long countAssignmentsByTeacher(Long teacherId);
}
