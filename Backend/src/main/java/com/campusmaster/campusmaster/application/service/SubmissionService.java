package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import java.util.List;

public interface SubmissionService {

    SubmissionResponse createSubmission(Long assignmentId, Long studentId, String filePath);

    SubmissionResponse getSubmissionById(Long submissionId);

    SubmissionResponse getMySubmissionForAssignment(Long assignmentId, Long studentId);

    List<SubmissionResponse> getSubmissionsByAssignment(Long assignmentId);

    List<SubmissionResponse> getSubmissionsByStudent(Long studentId);

    List<SubmissionResponse> getPendingSubmissionsByTeacher(Long teacherId);

    Long countPendingSubmissionsByTeacher(Long teacherId);

    SubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback);

    SubmissionResponse updateSubmission(Long submissionId, Long studentId, String newFilePath);

    void deleteSubmission(Long submissionId, Long studentId);

    boolean canModifySubmission(Long submissionId, Long studentId);
}
