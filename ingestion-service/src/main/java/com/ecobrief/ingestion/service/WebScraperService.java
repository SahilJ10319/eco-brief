package com.ecobrief.ingestion.service;

import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.stream.Collectors;

@Service
public class WebScraperService {

    public String extractArticleText(String url) {
        try {
            Document doc = Jsoup.connect(url)
                    .userAgent("Mozilla/5.0")
                    .timeout(5000)
                    .get();

            Element article = doc.selectFirst("article");
            if (article != null) {
                return article.select("p").stream()
                        .map(Element::text)
                        .collect(Collectors.joining("\n\n"));
            }

            return doc.select("p").stream()
                    .map(Element::text)
                    .collect(Collectors.joining("\n\n"));

        } catch (IOException e) {
            return "";
        }
    }
}
