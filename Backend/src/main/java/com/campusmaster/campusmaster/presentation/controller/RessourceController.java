package com.campusmaster.campusmaster.presentation.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.campusmaster.campusmaster.application.service.RessourceService;

@RestController
@RequestMapping("/ressource")
public class RessourceController {

    @Autowired
    private RessourceService ressourceService;

    @GetMapping("/{id}/download")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<UrlResource> download(@PathVariable Long id) {
        return ressourceService.download(id);
    }
}
