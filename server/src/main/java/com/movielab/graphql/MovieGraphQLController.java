package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.model.MoviePage;
import com.movielab.service.TmdbService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MovieGraphQLController {

    private final TmdbService tmdbService;
    private final MeterRegistry meterRegistry;

    public MovieGraphQLController(TmdbService tmdbService, MeterRegistry meterRegistry) {
        this.tmdbService = tmdbService;
        this.meterRegistry = meterRegistry;
    }

    @QueryMapping
    public MoviePage searchMovies(@Argument String query, @Argument Integer page) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.searchMovies(query, page != null ? page : 1);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "searchMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public Movie movie(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getMovie(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "movie")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public List<Movie> trendingMovies() {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getTrendingMovies();
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "trendingMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public MoviePage discoverMovies(@Argument List<Integer> genreIds,
                                     @Argument Double minRating,
                                     @Argument Integer page) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.discoverMovies(genreIds, minRating, page != null ? page : 1);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "discoverMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public List<Movie> recommendations(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getRecommendations(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "recommendations")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }
}
