package com.ecobrief.ingestion;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class IngestionApplication {

    // main entrypoint for the feed scraping scheduler
    public static void main(String[] args) {
        SpringApplication.run(IngestionApplication.class, args);
    }
}
