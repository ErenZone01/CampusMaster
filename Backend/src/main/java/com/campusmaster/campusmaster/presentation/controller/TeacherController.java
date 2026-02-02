package com.campusmaster.campusmaster.presentation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.dto.ModuleResponse;
import com.campusmaster.campusmaster.application.dto.RessourceResponse;
import com.campusmaster.campusmaster.application.dto.StudentResponse;
import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.service.AssignmentService;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.application.service.ModuleService;
import com.campusmaster.campusmaster.application.service.RessourceService;
import com.campusmaster.campusmaster.application.service.StudentService;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.assigment.Assignment;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@Tag(name = "Teacher", description = "Espace enseignant")
@RequestMapping("/teacher")
public class TeacherController {

    @Autowired
    private CourseService courseService;
    @Autowired
    private StudentService studentService;
    @Autowired
    private ModuleService moduleService;
    @Autowired
    private RessourceService ressourceService;
    @Autowired
    private AssignmentService assignmentService;
    @Autowired
    private SubmissionService submissionService;


    @PostMapping("/create/course")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        CourseResponse course = courseService.createCourse(request);
        return new ResponseEntity<>(course, HttpStatus.CREATED);
    }

    @PutMapping("/validation/{studentId}/{isValidated}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<StudentResponse> valideProfile(@AuthenticationPrincipal Teacher teacher,
            @PathVariable Long studentId, @PathVariable Boolean isValidated) {
        return new ResponseEntity<>(studentService.validateStudent(teacher, studentId, isValidated), HttpStatus.OK);
    }

    @GetMapping("/validation")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<StudentResponse>> invalidProfiles(@AuthenticationPrincipal Teacher teacher) {
        return new ResponseEntity<List<StudentResponse>>(studentService.invalidProfiles(teacher), HttpStatus.OK);
    }

    @GetMapping("/modules/{moduleId}/courses")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<CourseResponse>> getCourses(@AuthenticationPrincipal Teacher teacher,
            @PathVariable Long moduleId) {
        return new ResponseEntity<List<CourseResponse>>(courseService.getCoursesByTeacher(teacher, moduleId),
                HttpStatus.OK);
    }

    @GetMapping("/modules")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<List<ModuleResponse>> getModules(@AuthenticationPrincipal Teacher teacher) {
        return new ResponseEntity<List<ModuleResponse>>(moduleService.getModulesTeacher(teacher), HttpStatus.OK);
    }

    @PostMapping("/courses/{courseId}/ressource")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<RessourceResponse> addCourseRessource(
            @PathVariable Long courseId,
            @RequestParam String title,
            @RequestParam MultipartFile file) {

        return ResponseEntity.ok(ressourceService.add(courseId, title, file));
    }


    @PostMapping("/courses/{courseId}/create/assignment")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<AssignmentResponse> createAssignment(
            @PathVariable Long courseId,
            @RequestBody Assignment assignment) {

        return ResponseEntity.ok(
                assignmentService.createAssignment(courseId, assignment)
        );
    }

    @GetMapping("/courses/{courseId}/assignment")
    @PreAuthorize("hasRole('TEACHER')")
    public List<AssignmentResponse> getAssignmentsbyCourse(@PathVariable Long courseId) {
        return assignmentService.getAssignmentsByCourse(courseId);
    }


    @GetMapping("/assignment/{assignmentId}/submissions")
    @PreAuthorize("hasRole('TEACHER')")
    public List<SubmissionResponse> getAllSubmissionsForAssignment(@PathVariable Long assignmentId) {
        return submissionService.getSubmissionsForAssignment(assignmentId);
    }

    @PutMapping("submission/{id}/grade")
    @PreAuthorize("hasRole('TEACHER')")
    public SubmissionResponse gradeSubmission(
            @PathVariable Long id,
            @RequestParam Double grade,
            @RequestParam String feedback
    ) {
        return submissionService.gradeSubmission(id, grade, feedback);
    }

}
