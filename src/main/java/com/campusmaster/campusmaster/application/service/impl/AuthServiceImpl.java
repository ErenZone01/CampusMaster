package com.campusmaster.campusmaster.application.service.impl;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.dto.AuthResponse;
import com.campusmaster.campusmaster.application.dto.LoginRequest;
import com.campusmaster.campusmaster.application.dto.RegisterRequest;
import com.campusmaster.campusmaster.application.dto.UserResponse;
import com.campusmaster.campusmaster.application.service.AuthService;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.model.user.Student;
import com.campusmaster.campusmaster.domain.model.user.User;
import com.campusmaster.campusmaster.domain.repository.StudentRepository;
import com.campusmaster.campusmaster.domain.repository.UserRepository;
import com.campusmaster.campusmaster.infrastructure.security.config.JwtService;

import lombok.RequiredArgsConstructor;


@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final BCryptPasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    

    @Override
    public UserResponse register(RegisterRequest request) {
         // Logique d'enregistrement de l'utilisateur

        if (studentRepository.existsByEmail(request.getEmail()).isPresent()) {
            throw new IllegalArgumentException("Email already in use");
        }

        Student student = new Student();
        student.setFirstName(request.getFirstName());
        student.setLastName(request.getLastName());
        student.setEmail(request.getEmail());
        student.setPassword(passwordEncoder.encode(request.getPassword()));
        student.setRole(Role.STUDENT);
        student.setEnabled(false);
        String ine;
        do {
            ine = INEGenerator.generate();
        } while (studentRepository.existsByINE(ine));
        student.setINE(ine);



        studentRepository.save(student);

        return UserResponse.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(Role.STUDENT)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        // Logique d'authentification de l'utilisateur
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(() ->
         new IllegalArgumentException("Invalid email or password")
        );

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Invalid email, role or password");
        }


        String token = jwtService.generateToken(user.getEmail());
        AuthResponse response = new AuthResponse();
        response.setToken(token);
        response.setUser(UserResponse.builder()
                    .email(user.getEmail())
                    .firstName(user.getFirstName())
                    .lastName(user.getLastName())
                    .role(user.getRole())
                    .build());

        return response;
    }

}
