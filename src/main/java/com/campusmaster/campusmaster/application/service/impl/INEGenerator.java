package com.campusmaster.campusmaster.application.service.impl;

import java.security.SecureRandom;
import java.time.Year;

import org.springframework.stereotype.Service;

@Service
public final class INEGenerator {

    private static final String PREFIX = "N0";
    private static final String ALPHANUM = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int RANDOM_LEN = 8;

    private INEGenerator() { }

    public static String generate() {
        StringBuilder sb = new StringBuilder(PREFIX.length() + RANDOM_LEN + 4);
        sb.append(PREFIX);
        for (int i = 0; i < RANDOM_LEN; i++) {
            sb.append(ALPHANUM.charAt(RANDOM.nextInt(ALPHANUM.length())));
        }
        sb.append(Year.now().getValue());
        return sb.toString();
    }
}
