package com.campusmaster.campusmaster.infrastructure.security.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

@Configuration
public class AdminInitializer {

    @Bean
    CommandLineRunner initAdmin(UserRepository userRepository, BCryptPasswordEncoder passwordEncoder) {
       
        return args -> {
            if (!userRepository.existsByRole(Role.ADMIN)) {

                Admin admin = new Admin();
                admin.setFirstName("Super");
                admin.setLastName("Admin");
                admin.setEmail("admin@campusmaster.com");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setRole(Role.ADMIN);
                admin.setEnabled(true);
                admin.setAccess_Level("root");

                userRepository.save(admin);
            }
        };
    }
}
