package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.StudentResponse;

public interface TeacherService {
    StudentResponse validateStudent(Long studentId);
}
