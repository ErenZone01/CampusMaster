package com.campusmaster.campusmaster.application.service;


import com.campusmaster.campusmaster.application.dto.AuthResponse;
import com.campusmaster.campusmaster.application.dto.LoginRequest;
import com.campusmaster.campusmaster.application.dto.StudentRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;


public interface AuthService {
      // Add methods here
    UserResponse register(StudentRequest request);
    AuthResponse login(LoginRequest request);
    
} 
