package com.campusmaster.campusmaster.presentation.controller;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.AuthResponse;
import com.campusmaster.campusmaster.application.dto.LoginRequest;
import com.campusmaster.campusmaster.application.dto.StudentRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;
import com.campusmaster.campusmaster.application.service.AuthService;


@RestController
@RequestMapping("/auth")
public class Authentification {

    @Autowired
    private AuthService authService;


    @PostMapping("/register")
    UserResponse register(@RequestBody StudentRequest studentRequest) {
        // Logique d'enregistrement
        return authService.register(studentRequest);
    }

    @PostMapping("/login")
    ResponseEntity<AuthResponse> login(@RequestBody LoginRequest loginRequest) {
        // Logique de connexion
        return new ResponseEntity<>(authService.login(loginRequest), HttpStatus.OK) ;
    }


}
