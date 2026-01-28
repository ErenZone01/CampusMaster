package com.campusmaster.campusmaster.application.service;

import com.campusmaster.campusmaster.application.dto.CreateTeacherRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;

public interface AdminService {
    UserResponse createTeacher(CreateTeacherRequest request);
}
