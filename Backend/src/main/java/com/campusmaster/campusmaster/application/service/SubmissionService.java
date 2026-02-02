package com.campusmaster.campusmaster.application.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.domain.model.user.Student;

public interface SubmissionService {

    SubmissionResponse submit(Long assignmentId, Student student, MultipartFile file);

    List<SubmissionResponse> getSubmissionsForAssignment(Long assignmentId);

    SubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback);
}

