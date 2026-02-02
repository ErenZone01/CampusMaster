package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.user.Student;

public interface AssignmentService {

    AssignmentResponse createAssignment(Long courseId, Assignment assignment);

    List<AssignmentResponse> getAssignmentsByCourse(Long courseId);
    List<AssignmentResponse> getAssignmentsStudentByCourse(Student student, Long courseId);

    AssignmentResponse getAssignment(Long id);
}

