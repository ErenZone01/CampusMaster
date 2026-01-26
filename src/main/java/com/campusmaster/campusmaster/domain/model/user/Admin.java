package com.campusmaster.campusmaster.domain.model.user;


import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "admins")
@Getter
@Setter
public class Admin extends User {
    @Column(nullable = false, unique = true)
    private String Access_Level;
}
