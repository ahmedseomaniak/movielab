package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private final WebClient webClient;
    private final String imageBaseUrl;

    public TmdbService(WebClient tmdbWebClient,
                       @Value("${tmdb.image-base-url}") String imageBaseUrl) {
        this.webClient = tmdbWebClient;
        this.imageBaseUrl = imageBaseUrl;
    }

    public List<Movie> searchMovies(String query, int page) {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/search/movie")
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public Movie getMovie(int tmdbId) {
        Mono<TmdbMovieResponse> movieMono = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId)
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieResponse.class);

        Mono<TmdbCreditsResponse> creditsMono = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId + "/credits")
                        .build())
                .retrieve()
                .bodyToMono(TmdbCreditsResponse.class);

        return Mono.zip(movieMono, creditsMono)
                .map(tuple -> {
                    TmdbMovieResponse movie = tuple.getT1();
                    TmdbCreditsResponse credits = tuple.getT2();
                    return mapToMovie(movie, credits);
                })
                .block();
    }

    public List<Movie> getTrendingMovies() {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/trending/movie/week")
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        TmdbDiscoverResponse response = webClient.get()
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
                .bodyToMono(TmdbDiscoverResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public List<Movie> getRecommendations(int tmdbId) {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations")
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
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
