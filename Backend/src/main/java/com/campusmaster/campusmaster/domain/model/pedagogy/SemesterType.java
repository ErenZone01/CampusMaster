package com.campusmaster.campusmaster.domain.model.pedagogy;

public enum SemesterType {
    SEMESTRE_1("Semestre 1", "S1"),
    SEMESTRE_2("Semestre 2", "S2");

    private final String displayName;
    private final String code;

    SemesterType(String displayName, String code) {
        this.displayName = displayName;
        this.code = code;
    }

    public String getDisplayName() {
        return displayName;
    }

    public String getCode() {
        return code;
    }
}
