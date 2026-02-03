package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;

public interface SubmissionService {
    
    List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId);
    
    List<SubmissionResponse> getSubmissionsByStudent(Long studentId);
    
    List<SubmissionResponse> getPendingSubmissionsByTeacher(Long teacherId);
    
    Long countPendingSubmissionsByTeacher(Long teacherId);
    
    SubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback);
}
