package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.domain.model.user.Student;

public interface TeacherService {
    Student validateStudent(Long studentId);
}
