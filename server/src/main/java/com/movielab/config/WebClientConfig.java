package com.movielab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

@Configuration
public class WebClientConfig {

    @Value("${tmdb.api.base-url}")
    private String tmdbBaseUrl;

    @Value("${tmdb.api.key}")
    private String apiKey;

    @Bean
    public RestClient tmdbRestClient() {
        return RestClient.builder()
                .baseUrl(tmdbBaseUrl)
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
    }
}
