package com.campusmaster.campusmaster.application.service.impl;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CreateAssignmentRequest;
import com.campusmaster.campusmaster.application.dto.UpdateAssignmentRequest;
import com.campusmaster.campusmaster.application.service.AssignmentService;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.course.Course;
import com.campusmaster.campusmaster.domain.model.user.Teacher;
import com.campusmaster.campusmaster.domain.repository.CourseRepository;
import com.campusmaster.campusmaster.domain.repository.TeacherRepository;
import com.campusmaster.campusmaster.infrastructure.persistence.assignment.AssignmentRepository;
import java.util.List;
import java.util.stream.Collectors;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentServiceImpl implements AssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final CourseRepository courseRepository;
    private final TeacherRepository teacherRepository;

    @Override
    public AssignmentResponse createAssignment(CreateAssignmentRequest request, Long teacherId) {
        Course course = courseRepository
                .findById(request.getCourseId())
                .orElseThrow(
                        () -> new RuntimeException(
                                "Cours non trouvé avec l'id: "
                                        + request.getCourseId()));

        Teacher teacher = teacherRepository
                .findById(teacherId)
                .orElseThrow(
                        () -> new RuntimeException(
                                "Enseignant non trouvé avec l'id: " + teacherId));

        Assignment assignment = new Assignment();
        assignment.setTitle(request.getTitle());
        assignment.setInstructions(request.getInstructions());
        assignment.setDueDate(request.getDueDate());
        assignment.setFilePath(request.getFilePath());
        assignment.setCourse(course);
        assignment.setTeacher(teacher);

        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.fromEntity(saved);
    }

    @Override
    public AssignmentResponse updateAssignment(Long id, UpdateAssignmentRequest request) {
        Assignment assignment = assignmentRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Devoir non trouvé avec l'id: " + id));

        if (request.getTitle() != null) {
            assignment.setTitle(request.getTitle());
        }
        if (request.getInstructions() != null) {
            assignment.setInstructions(request.getInstructions());
        }
        if (request.getDueDate() != null) {
            assignment.setDueDate(request.getDueDate());
        }
        if (request.getFilePath() != null) {
            assignment.setFilePath(request.getFilePath());
        }

        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.fromEntity(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = assignmentRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Devoir non trouvé avec l'id: " + id));
        return AssignmentResponse.fromEntity(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByCourse(Long courseId) {
        List<Assignment> assignments = assignmentRepository.findByCourseId(courseId);
        return assignments.stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AssignmentResponse> getAssignmentsByTeacher(Long teacherId) {
        List<Assignment> assignments = assignmentRepository.findByTeacherIdOrderByDueDateDesc(teacherId);
        return assignments.stream()
                .map(AssignmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteAssignment(Long id) {
        Assignment assignment = assignmentRepository
                .findById(id)
                .orElseThrow(
                        () -> new RuntimeException("Devoir non trouvé avec l'id: " + id));
        assignmentRepository.delete(assignment);
    }

    @Override
    @Transactional(readOnly = true)
    public Long countAssignmentsByTeacher(Long teacherId) {
        return assignmentRepository.countByTeacherId(teacherId);
    }
}
