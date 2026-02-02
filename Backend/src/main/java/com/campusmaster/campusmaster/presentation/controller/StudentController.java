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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.campusmaster.campusmaster.application.dto.AssignmentResponse;
import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.dto.ModuleResponse;
import com.campusmaster.campusmaster.application.dto.RessourceResponse;
import com.campusmaster.campusmaster.application.dto.SubmissionResponse;
import com.campusmaster.campusmaster.application.service.AssignmentService;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.application.service.ModuleService;
import com.campusmaster.campusmaster.application.service.RessourceService;
import com.campusmaster.campusmaster.application.service.SubmissionService;
import com.campusmaster.campusmaster.domain.model.user.Student;


@RestController
@RequestMapping("student")
public class StudentController {

    @Autowired
    private ModuleService moduleService;
    @Autowired
    private CourseService courseService;
    @Autowired
    private RessourceService ressourceService;
    @Autowired
    private AssignmentService assignmentService;
    @Autowired
    private SubmissionService submissionService;

    
    @GetMapping("/modules")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<ModuleResponse>> getModules(@AuthenticationPrincipal Student student){
        return new ResponseEntity<>(moduleService.getModules(student), HttpStatus.OK);
    }

    @GetMapping("/modules/{moduleId}/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseResponse>> getCoursesByModule(@AuthenticationPrincipal Student student, @PathVariable Long moduleId){
        return new ResponseEntity<>(courseService.getCoursesByModule(student, moduleId), HttpStatus.OK);
    }
    @GetMapping("/modules/courses/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<RessourceResponse>> getRessourceByCourse(@AuthenticationPrincipal Student student, @PathVariable Long courseId){
        return new ResponseEntity<>(ressourceService.getRessourceByCourse(student, courseId), HttpStatus.OK);
    }
    @GetMapping("/courses/{courseId}/assignment")
    @PreAuthorize("hasRole('STUDENT')")
    public List<AssignmentResponse> getAssignmentsbyCourse(@AuthenticationPrincipal Student student ,@PathVariable Long courseId) {
        return assignmentService.getAssignmentsStudentByCourse(student, courseId);
    }


    @PostMapping("/assignment/{assignmentId}/submission")
    @PreAuthorize("hasRole('STUDENT')")
    public SubmissionResponse submit(
            @AuthenticationPrincipal Student student,
            @PathVariable Long assignmentId,
            @RequestParam MultipartFile file
    ) {
        return submissionService.submit(assignmentId, student, file);
    }
}
