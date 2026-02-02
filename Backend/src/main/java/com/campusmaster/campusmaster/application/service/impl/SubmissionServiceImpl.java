package com.campusmaster.campusmaster.application.service.impl;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.assigment.Submission;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.AssignmentRepository;
import com.campusmaster.campusmaster.domain.repository.SubmissionRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    @Autowired
    private SubmissionRepository submissionRepository;
    @Autowired
    private AssignmentRepository assignmentRepository;
    @Autowired
    private FileStorageService fileStorageService;

    @Override
    public SubmissionResponse submit(Long assignmentId, Student student, MultipartFile file) {

        Assignment assignment = assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Assignment not found"));

        // ⛔ Deadline
        if (LocalDateTime.now().isAfter(assignment.getDeadline())) {
            throw new RuntimeException("Deadline passed");
        }

        if (!student.isValidated()) {
            throw new RuntimeException("Student not validated");
        }

        // ⛔ Déjà soumis ?
        submissionRepository.findByAssignmentIdAndStudentId(assignmentId, student.getId())
                .ifPresent(s -> {
                    throw new RuntimeException("Already submitted");
                });

        // 💾 Sauvegarde fichier
        String path = fileStorageService.store(
                file,
                "assignments/" + assignmentId + "/students/" + student.getId());

        Submission submission = Submission.builder()
                .assignment(assignment)
                .student(student)
                .filename(file.getOriginalFilename())
                .filetype(file.getContentType())
                .filepath(path)
                .submittedAt(LocalDateTime.now())
                .build();

        Submission tmp = submissionRepository.save(submission);
        return SubmissionResponse.builder()
                .id(tmp.getId())
                .assignmentId(tmp.getAssignment().getId())
                .feedback(tmp.getFeedback())
                .filename(tmp.getFilename())
                .filepath(tmp.getFilepath())
                .filetype(tmp.getFiletype())
                .studentId(tmp.getStudent().getId())
                .submittedAt(tmp.getSubmittedAt())
                .grade(tmp.getGrade())
                .build();
    }

    @Override
    public List<SubmissionResponse> getSubmissionsForAssignment(Long assignmentId) {
        List<Submission> submissions = submissionRepository.findByAssignmentId(assignmentId);
        return submissions.stream().map(e -> SubmissionResponse.builder()
                .id(e.getId())
                .assignmentId(e.getAssignment().getId())
                .feedback(e.getFeedback())
                .filename(e.getFilename())
                .filepath(e.getFilepath())
                .filetype(e.getFiletype())
                .studentId(e.getStudent().getId())
                .submittedAt(e.getSubmittedAt())
                .grade(e.getGrade())
                .build()).toList();
    }

    @Override
    public SubmissionResponse gradeSubmission(Long submissionId, Double grade, String feedback) {

        Submission submission = submissionRepository.findById(submissionId)
                .orElseThrow(() -> new RuntimeException("Submission not found"));

        submission.setGrade(grade);
        submission.setFeedback(feedback);

        Submission tmp = submissionRepository.save(submission);
        return SubmissionResponse.builder()
                .id(tmp.getId())
                .assignmentId(tmp.getAssignment().getId())
                .feedback(tmp.getFeedback())
                .filename(tmp.getFilename())
                .filepath(tmp.getFilepath())
                .filetype(tmp.getFiletype())
                .studentId(tmp.getStudent().getId())
                .submittedAt(tmp.getSubmittedAt())
                .grade(tmp.getGrade())
                .build();
    }

}
