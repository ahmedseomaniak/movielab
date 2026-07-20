package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.service.TmdbService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MovieGraphQLController {

    private final TmdbService tmdbService;

    public MovieGraphQLController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @QueryMapping
    public List<Movie> searchMovies(@Argument String query, @Argument Integer page) {
        return tmdbService.searchMovies(query, page != null ? page : 1);
    }

    @QueryMapping
    public Movie movie(@Argument int tmdbId) {
        return tmdbService.getMovie(tmdbId);
    }

    @QueryMapping
    public List<Movie> trendingMovies() {
        return tmdbService.getTrendingMovies();
    }

    @QueryMapping
    public List<Movie> discoverMovies(@Argument List<Integer> genreIds,
                                       @Argument Double minRating,
                                       @Argument Integer page) {
        return tmdbService.discoverMovies(genreIds, minRating, page != null ? page : 1);
    }

    @QueryMapping
    public List<Movie> recommendations(@Argument int tmdbId) {
        return tmdbService.getRecommendations(tmdbId);
    }
}
