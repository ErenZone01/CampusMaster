package com.campusmaster.campusmaster.infrastructure.security.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;

@Configuration
public class OpenApiConfig {
    @Bean
    public OpenAPI campusMasterOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("CampusMaster API")
                        .description("API de gestion académique (Admin, Teacher, Student)")
                        .version("1.0.0"));
    }
}
