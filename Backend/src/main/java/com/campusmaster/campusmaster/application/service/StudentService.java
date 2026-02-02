package com.campusmaster.campusmaster.application.service;

import java.util.List;

import com.campusmaster.campusmaster.application.dto.StudentResponse;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

public interface StudentService {
    StudentResponse validateStudent(Teacher teacher,Long studentId, Boolean isValidated);
    List<StudentResponse> invalidProfiles(Teacher teacher);
}
