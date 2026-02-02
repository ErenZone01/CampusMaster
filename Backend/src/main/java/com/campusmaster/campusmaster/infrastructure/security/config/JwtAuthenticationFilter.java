package com.campusmaster.campusmaster.infrastructure.security.config;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import com.campusmaster.campusmaster.domain.repository.UserRepository;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthenticationFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        System.out.println("[JwtFilter] Processing request: " + request.getRequestURI());
        
        String authHeader = request.getHeader("Authorization");
        System.out.println("[JwtFilter] Authorization header: " + (authHeader != null ? "Present" : "Missing"));
        
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            System.out.println("[JwtFilter] No valid Authorization header, skipping authentication");
            filterChain.doFilter(request, response);
            return;
        }
        String token = authHeader.substring(7);
        System.out.println("[JwtFilter] Token extracted, length: " + token.length());

        if (!jwtService.isTokenValid(token)) {
            System.out.println("[JwtFilter] Token is INVALID");
            filterChain.doFilter(request, response);
            return;
        }
        System.out.println("[JwtFilter] Token is VALID");

        String email = jwtService.extractEmail(token);
        System.out.println("[JwtFilter] Email extracted from token: " + email);
        
        var user = userRepository.findByEmail(email).orElse(null);
        System.out.println("[JwtFilter] User found in DB: " + (user != null));

        if (user != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                user, 
                null, 
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()))
            );
            authentication.setDetails(
                    new WebAuthenticationDetailsSource().buildDetails(request)
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);
            System.out.println("[JwtFilter] Authentication set in SecurityContext for user: " + email + " with role: " + user.getRole());
        }

        filterChain.doFilter(request, response);
        
    }

    

}
