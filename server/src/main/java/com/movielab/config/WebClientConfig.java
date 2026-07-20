package com.movielab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${tmdb.api.base-url}")
    private String tmdbBaseUrl;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Bean
    public WebClient tmdbWebClient(WebClient.Builder builder) {
        return builder
                .baseUrl(tmdbBaseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }
}
