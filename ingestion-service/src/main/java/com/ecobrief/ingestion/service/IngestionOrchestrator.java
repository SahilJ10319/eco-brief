package com.ecobrief.ingestion.service;

import com.ecobrief.ingestion.model.Article;
import com.ecobrief.ingestion.model.FeedSource;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class IngestionOrchestrator {

    private final FeedParserService feedParser;
    private final WebScraperService webScraper;
    private final DataSanitizerService sanitizer;
    private final S3StorageService s3Storage;

    public IngestionOrchestrator(
            FeedParserService feedParser,
            WebScraperService webScraper,
            DataSanitizerService sanitizer,
            S3StorageService s3Storage
    ) {
        this.feedParser = feedParser;
        this.webScraper = webScraper;
        this.sanitizer = sanitizer;
        this.s3Storage = s3Storage;
    }

    public void ingest(List<FeedSource> sources) {
        for (FeedSource source : sources) {
            List<Article> articles = feedParser.parseFeed(source);
            for (Article article : articles) {
                String fullText = webScraper.extractArticleText(article.link());
                String combined = article.title() + "\n\n" + fullText;
                String clean = sanitizer.sanitize(combined);

                if (clean.isBlank()) {
                    continue;
                }

                String key = "raw/" + source.id() + "/" + article.id() + ".txt";
                s3Storage.uploadPayload(key, clean);
            }
        }
    }

    public void ingestWithTimestamp(List<FeedSource> sources) {
        long start = Instant.now().toEpochMilli();
        ingest(sources);
        long elapsed = Instant.now().toEpochMilli() - start;
        System.out.println("ingestion run completed in " + elapsed + "ms");
    }
}
