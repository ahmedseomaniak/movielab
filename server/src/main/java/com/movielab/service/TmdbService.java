package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private final RestClient restClient;
    private final String imageBaseUrl;
    private final Counter tmdbErrorCounter;

    public TmdbService(RestClient tmdbRestClient,
                       @Value("${tmdb.image-base-url}") String imageBaseUrl,
                       MeterRegistry meterRegistry) {
        this.restClient = tmdbRestClient;
        this.imageBaseUrl = imageBaseUrl;
        this.tmdbErrorCounter = Counter.builder("movielab.tmdb.errors")
                .description("TMDB API call errors")
                .register(meterRegistry);
    }

    public List<Movie> searchMovies(String query, int page) {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("page", page)
                            .build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public Movie getMovie(int tmdbId) {
        try {
            TmdbMovieResponse movieResponse = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId).build())
                    .retrieve()
                    .body(TmdbMovieResponse.class);

            TmdbCreditsResponse creditsResponse = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/credits").build())
                    .retrieve()
                    .body(TmdbCreditsResponse.class);

            return mapToMovie(movieResponse, creditsResponse);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            throw e;
        }
    }

    public List<Movie> getTrendingMovies() {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/trending/movie/week").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        try {
            TmdbDiscoverResponse response = restClient.get()
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
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public List<Movie> getRecommendations(int tmdbId) {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    private Movie mapToMovie(TmdbMovieResponse tmdb, TmdbCreditsResponse credits) {
        List<String> genres = Optional.ofNullable(tmdb.getGenres())
                .map(g -> g.stream().map(TmdbGenreResponse::getName).collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        List<CastMember> cast = Optional.ofNullable(credits)
                .map(c -> c.getCast().stream()
                        .limit(10)
                        .map(actor -> new CastMember(
                                actor.getName(),
                                actor.getCharacter(),
                                actor.getProfilePath() != null ? imageBaseUrl + actor.getProfilePath() : null))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        return new Movie(
                tmdb.getId(),
                tmdb.getTitle(),
                tmdb.getOverview(),
                tmdb.getPosterPath() != null ? imageBaseUrl + tmdb.getPosterPath() : null,
                tmdb.getBackdropPath() != null ? imageBaseUrl + tmdb.getBackdropPath() : null,
                tmdb.getReleaseDate(),
                tmdb.getVoteAverage(),
                genres,
                cast,
                tmdb.getRuntime()
        );
    }

    private Movie mapToMovieSimple(TmdbMovieResponse tmdb) {
        return mapToMovie(tmdb, null);
    }

    private List<Movie> mapToMovies(List<TmdbMovieResponse> results) {
        return results.stream().map(this::mapToMovieSimple).collect(Collectors.toList());
    }
}
