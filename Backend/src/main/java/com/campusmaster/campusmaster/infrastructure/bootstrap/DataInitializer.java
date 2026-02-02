package com.campusmaster.campusmaster.infrastructure.bootstrap;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;

import com.campusmaster.campusmaster.domain.model.user.Admin;
import com.campusmaster.campusmaster.domain.model.user.Role;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        initializeAdmin();
    }

    private void initializeAdmin() {
        long adminCount = userRepository.countByRole(Role.ADMIN);
        
        if (adminCount == 0) {
            Admin admin = new Admin();
            admin.setFirstName("Super");
            admin.setLastName("Admin");
            admin.setEmail("admin@campusmaster.com");
            admin.setPassword(passwordEncoder.encode("admin123"));
            admin.setRole(Role.ADMIN);
            admin.setEnabled(true);
            admin.setAccess_Level("SUPER_ADMIN");
            
            userRepository.save(admin);
            log.info("✅ Admin par défaut créé: admin@campusmaster.com / admin123");
        } else {
            log.info("ℹ️ Admin déjà existant, initialisation ignorée");
        }
    }
}
