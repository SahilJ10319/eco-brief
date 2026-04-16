package com.ecobrief.ingestion.model;

import java.time.Instant;

public record Article(
        String id,
        String source,
        String title,
        String link,
        String rawContent,
        Instant publishedAt
) {}
