package com.campusmaster.campusmaster.presentation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.CreateCourseRequest;
import com.campusmaster.campusmaster.application.dto.StudentResponse;
import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.application.service.TeacherService;
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
    private TeacherService teacherService;

    @PostMapping("/create/course")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<CourseResponse> createCourse(@Valid @RequestBody CreateCourseRequest request) {
        CourseResponse course = courseService.createCourse(request); 
        return new ResponseEntity<>(course, HttpStatus.CREATED);
    }

    @PostMapping("/validation/{studentId}/{isValidated}")
    @PreAuthorize("hasRole('TEACHER')")
    public ResponseEntity<StudentResponse> valideProfile(@AuthenticationPrincipal Teacher teacher, @PathVariable Long studentId, @PathVariable Boolean isValidated){
        return new ResponseEntity<>(teacherService.validateStudent(teacher, studentId, isValidated), HttpStatus.OK);
    }
}
