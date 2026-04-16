package com.ecobrief.ingestion.service;

import com.ecobrief.ingestion.model.Article;
import com.ecobrief.ingestion.model.FeedSource;
import com.rometools.rome.feed.synd.SyndEntry;
import com.rometools.rome.feed.synd.SyndFeed;
import com.rometools.rome.io.FeedException;
import com.rometools.rome.io.SyndFeedInput;
import com.rometools.rome.io.XmlReader;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URL;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

@Service
public class FeedParserService {

    public List<Article> parseFeed(FeedSource source) {
        try {
            URL feedUrl = new URL(source.url());
            SyndFeedInput input = new SyndFeedInput();
            SyndFeed feed = input.build(new XmlReader(feedUrl));
            
            List<Article> articles = new ArrayList<>();
            for (SyndEntry entry : feed.getEntries()) {
                articles.add(mapToArticle(entry, source));
            }
            return articles;
        } catch (FeedException | IOException e) {
            return Collections.emptyList();
        }
    }

    private Article mapToArticle(SyndEntry entry, FeedSource source) {
        String content = entry.getDescription() != null ? entry.getDescription().getValue() : "";
        Instant pubDate = entry.getPublishedDate() != null ? entry.getPublishedDate().toInstant() : Instant.now();
        
        return new Article(
                UUID.randomUUID().toString(),
                source.name(),
                entry.getTitle(),
                entry.getLink(),
                content,
                pubDate
        );
    }
}
