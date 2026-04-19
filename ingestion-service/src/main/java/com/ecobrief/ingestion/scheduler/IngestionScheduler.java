package com.ecobrief.ingestion.scheduler;

import com.ecobrief.ingestion.model.FeedSource;
import com.ecobrief.ingestion.service.IngestionOrchestrator;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class IngestionScheduler {

    private final IngestionOrchestrator orchestrator;

    private static final List<FeedSource> SOURCES = List.of(
        new FeedSource("bbc-news",     "http://feeds.bbci.co.uk/news/rss.xml",                       "BBC News"),
        new FeedSource("reuters",      "https://feeds.reuters.com/reuters/topNews",                   "Reuters"),
        new FeedSource("hn",           "https://hnrss.org/frontpage",                                 "Hacker News"),
        new FeedSource("techcrunch",   "https://techcrunch.com/feed/",                                "TechCrunch"),
        new FeedSource("guardian-intl","https://www.theguardian.com/world/rss",                       "The Guardian")
    );

    public IngestionScheduler(IngestionOrchestrator orchestrator) {
        this.orchestrator = orchestrator;
    }

    @Scheduled(cron = "0 0 */6 * * *")
    public void runScheduledIngestion() {
        orchestrator.ingestWithTimestamp(SOURCES);
    }
}
