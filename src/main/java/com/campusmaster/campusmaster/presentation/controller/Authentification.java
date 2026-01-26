package com.campusmaster.campusmaster.presentation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.dto.AuthResponse;
import com.campusmaster.campusmaster.application.dto.LoginRequest;
import com.campusmaster.campusmaster.application.dto.RegisterRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;
import com.campusmaster.campusmaster.application.service.AuthService;

import io.swagger.v3.oas.annotations.parameters.RequestBody;

@RestController
@RequestMapping("/auth")
public class Authentification {

    @Autowired
    private AuthService authService;


    @PostMapping("/register")
    UserResponse register(@RequestBody RegisterRequest registerRequest) {
        // Logique d'enregistrement
        return authService.register(registerRequest);
    }

    @PostMapping("/login")
    AuthResponse login(@RequestBody LoginRequest loginRequest) {
        // Logique de connexion
        return authService.login(loginRequest);
    }

    @PostMapping("/admin-only")
    @PreAuthorize("hasRole('ADMIN')")
    public String adminEndpoint() {
        return "Only admins can see this!";
    }
}
