package com.campusmaster.campusmaster.application.service.impl;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.service.AssignmentService;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.repository.AssignmentRepository;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;

@Service
public class AssignmentServiceImpl implements AssignmentService {
    @Autowired
    private  AssignmentRepository assignmentRepository;
    @Autowired
    private  CourseRepository courseRepository;

    @Override
    public AssignmentResponse createAssignment(Long courseId, Assignment assignment) {

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        assignment.setCourse(course);
        Assignment tmp =  assignmentRepository.save(assignment);
        return AssignmentResponse.builder().courseId(courseId).deadline(tmp.getDeadline()).description(tmp.getDescription()).id(tmp.getId()).instruction(tmp.getInstruction()).published(tmp.isPublished()).title(tmp.getTitle()).build();
    }

    @Override
    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId) {
        List<Assignment> assignments =  assignmentRepository.findByCourseId(courseId);
        return assignments.stream().map(e-> AssignmentResponse.builder().courseId(courseId).deadline(e.getDeadline()).description(e.getDescription()).id(e.getId()).instruction(e.getInstruction()).published(e.isPublished()).title(e.getTitle()).build()).toList();
    }

    @Override
    public AssignmentResponse getAssignment(Long id) {
        return null;
    }

    @Override
    public List<AssignmentResponse> getAssignmentsStudentByCourse(Student student, Long courseId) {
        if (!student.isValidated()) {
            throw new AccessDeniedException("Profil étudiant non validé");
        }
        List<Assignment> assignments =  assignmentRepository.findByCourseId(courseId);
        return assignments.stream().map(e-> AssignmentResponse.builder().courseId(courseId).deadline(e.getDeadline()).description(e.getDescription()).id(e.getId()).instruction(e.getInstruction()).published(e.isPublished()).title(e.getTitle()).build()).toList();
    }

}
