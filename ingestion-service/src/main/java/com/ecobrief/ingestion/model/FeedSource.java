package com.ecobrief.ingestion.model;

public record FeedSource(
        String id,
        String url,
        String name
) {}
