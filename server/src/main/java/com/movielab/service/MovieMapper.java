package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class MovieMapper {

    private final String imageBaseUrl;

    public MovieMapper(@Value("${tmdb.image-base-url}") String imageBaseUrl) {
        this.imageBaseUrl = imageBaseUrl;
    }

    public Movie toMovie(TmdbMovieResponse tmdb, TmdbCreditsResponse credits) {
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

    public Movie toMovieSimple(TmdbMovieResponse tmdb) {
        return toMovie(tmdb, null);
    }

    public List<Movie> toMovies(List<TmdbMovieResponse> results) {
        return results.stream().map(this::toMovieSimple).collect(Collectors.toList());
    }
}
