package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CreateTeacherRequest;
import com.campusmaster.campusmaster.domain.model.user.Teacher;

public interface AdminService {
    Teacher createTeacher(CreateTeacherRequest request);
}
