package com.movielab.service;

import com.movielab.model.Movie;
import com.movielab.model.MoviePage;
import com.movielab.model.PageInfo;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class TmdbService {

    private final TmdbClient tmdbClient;
    private final MovieMapper movieMapper;

    public TmdbService(TmdbClient tmdbClient, MovieMapper movieMapper) {
        this.tmdbClient = tmdbClient;
        this.movieMapper = movieMapper;
    }

    public MoviePage searchMovies(String query, int page) {
        return tmdbClient.searchMovies(query, page)
                .map(r -> new MoviePage(movieMapper.toMovies(r.getResults()), new PageInfo(r.getPage(), r.getTotalPages())))
                .orElse(new MoviePage(Collections.emptyList(), new PageInfo(1, 1)));
    }

    public Movie getMovie(int tmdbId) {
        var movieResponse = tmdbClient.getMovie(tmdbId);
        var creditsResponse = tmdbClient.getCredits(tmdbId);
        return movieMapper.toMovie(movieResponse, creditsResponse);
    }

    public List<Movie> getTrendingMovies() {
        return tmdbClient.getTrendingMovies()
                .map(r -> movieMapper.toMovies(r.getResults()))
                .orElse(Collections.emptyList());
    }

    public MoviePage discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        return tmdbClient.discoverMovies(genreIds, minRating, page)
                .map(r -> new MoviePage(movieMapper.toMovies(r.getResults()), new PageInfo(r.getPage(), r.getTotalPages())))
                .orElse(new MoviePage(Collections.emptyList(), new PageInfo(1, 1)));
    }

    public List<Movie> getRecommendations(int tmdbId) {
        return tmdbClient.getRecommendations(tmdbId)
                .map(r -> movieMapper.toMovies(r.getResults()))
                .orElse(Collections.emptyList());
    }
}
