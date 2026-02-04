package com.campusmaster.campusmaster.domain.model.user;

import com.campusmaster.campusmaster.domain.model.course.Course;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "teachers")
@Getter
@Setter
public class Teacher extends User {

    @Column(nullable = false)
    private String department;

    @OneToMany(mappedBy = "teacher")
    private List<Course> courses;
}
