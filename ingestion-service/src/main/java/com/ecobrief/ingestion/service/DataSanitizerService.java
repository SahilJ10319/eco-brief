package com.ecobrief.ingestion.service;

import org.springframework.stereotype.Service;
import java.util.regex.Pattern;

@Service
public class DataSanitizerService {

    private static final Pattern HTML_TAGS_PATTERN = Pattern.compile("<[^>]*>");
    private static final Pattern EXTRA_WHITESPACE_PATTERN = Pattern.compile("\\s+");

    public String sanitize(String rawText) {
        if (rawText == null || rawText.isBlank()) {
            return "";
        }
        String noTags = HTML_TAGS_PATTERN.matcher(rawText).replaceAll("");
        String collapsedWhitespace = EXTRA_WHITESPACE_PATTERN.matcher(noTags).replaceAll(" ");
        String noSpecialChars = collapsedWhitespace.replaceAll("[^\\x00-\\x7F]", "");
        return noSpecialChars.trim();
    }
}
