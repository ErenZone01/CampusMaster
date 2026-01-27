package com.campusmaster.campusmaster.domain.model.user;

import java.sql.Date;
import com.campusmaster.campusmaster.domain.model.pedagogy.Department;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class Student extends User {

    @Column(nullable = false)
    private Date dateOfBirth;

    @Column(nullable = false)
    private boolean validated = false;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "department_id", nullable = false)
    private Department department;

    @Column(nullable = false)
    private String gender;

    @Column(nullable = false, unique = true)
    private String INE;


}
