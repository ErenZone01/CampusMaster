package com.campusmaster.campusmaster.presentation.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.CourseResponse;
import com.campusmaster.campusmaster.application.service.CourseService;
import com.campusmaster.campusmaster.domain.model.user.Student;


@RestController
@RequestMapping("student")
public class StudentController {

    @Autowired
    private CourseService courseService;

    @GetMapping("/courses")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<CourseResponse>> getCourses(@AuthenticationPrincipal Student student){
        return new ResponseEntity<>(courseService.getAllCourses(student), HttpStatus.OK);
    }
}
