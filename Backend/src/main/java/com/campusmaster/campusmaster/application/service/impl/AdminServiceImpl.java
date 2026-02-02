package com.campusmaster.campusmaster.application.service.impl;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.campusmaster.campusmaster.application.service.AdminService;
import com.campusmaster.campusmaster.domain.repository.UserRepository;

@Service
public class AdminServiceImpl implements AdminService {

    @Autowired
    private UserRepository userRepository;
    
    @Override
    public void deleteAccount(Long id){
        if (!userRepository.existsById(id)){
            throw new IllegalArgumentException("Id: " + id + " doesn't exist");
        }
        userRepository.deleteById(id);
    }
    
}
