package com.movielab.service;

import com.movielab.model.tmdb.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class TmdbClient {

    private final RestClient restClient;
    private final Counter tmdbErrorCounter;

    public TmdbClient(RestClient tmdbRestClient, MeterRegistry meterRegistry) {
        this.restClient = tmdbRestClient;
        this.tmdbErrorCounter = Counter.builder("movielab.tmdb.errors")
                .description("TMDB API call errors")
                .register(meterRegistry);
    }

    public TmdbSearchResponse searchMovies(String query, int page) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("page", page)
                            .build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbMovieResponse getMovie(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId).build())
                    .retrieve()
                    .body(TmdbMovieResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            throw e;
        }
    }

    public TmdbCreditsResponse getCredits(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/credits").build())
                    .retrieve()
                    .body(TmdbCreditsResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            throw e;
        }
    }

    public TmdbSearchResponse getTrendingMovies() {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/trending/movie/week").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbDiscoverResponse discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        try {
            return restClient.get()
                    .uri(uri -> {
                        var u = uri.path("/discover/movie")
                                .queryParam("page", page)
                                .queryParam("sort_by", "vote_average.desc")
                                .queryParam("vote_count.gte", 100);
                        if (genreIds != null && !genreIds.isEmpty()) {
                            u = u.queryParam("with_genres",
                                    genreIds.stream().map(String::valueOf).collect(Collectors.joining(",")));
                        }
                        if (minRating != null) {
                            u = u.queryParam("vote_average.gte", minRating);
                        }
                        return u.build();
                    })
                    .retrieve()
                    .body(TmdbDiscoverResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbSearchResponse getRecommendations(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }
}
