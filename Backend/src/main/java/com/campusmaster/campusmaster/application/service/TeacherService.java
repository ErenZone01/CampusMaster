package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.StudentResponse;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

public interface TeacherService {
    StudentResponse validateStudent(Teacher teacher,Long studentId, Boolean isValidated);
}
