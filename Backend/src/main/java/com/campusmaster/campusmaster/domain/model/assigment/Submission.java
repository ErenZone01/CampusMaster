package com.campusmaster.campusmaster.domain.model.assigment;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

import com.campusmaster.campusmaster.domain.model.user.Student;

@Entity
@Table(
    name = "submissions",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"assignment_id", "student_id"})
    }
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 📄 Fichier
    @Column(nullable = false)
    private String filename;

    @Column(nullable = false)
    private String filepath;

    @Column(nullable = false)
    private String filetype;

    // ⏱️ Date de soumission
    @Column(nullable = false)
    private LocalDateTime submittedAt;

    // 🎓 Note
    private Double grade;

    @Column(length = 1000)
    private String feedback;

    // 🔗 Relations
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "assignment_id")
    private Assignment assignment;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id")
    private Student student;
}
