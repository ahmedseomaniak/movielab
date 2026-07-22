package com.movielab.service;

import com.movielab.model.Movie;
import com.movielab.model.tmdb.TmdbMovieResponse;
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

    public List<Movie> searchMovies(String query, int page) {
        var response = tmdbClient.searchMovies(query, page);
        List<TmdbMovieResponse> results = response != null ? response.getResults() : Collections.emptyList();
        return movieMapper.toMovies(results);
    }

    public Movie getMovie(int tmdbId) {
        var movieResponse = tmdbClient.getMovie(tmdbId);
        var creditsResponse = tmdbClient.getCredits(tmdbId);
        return movieMapper.toMovie(movieResponse, creditsResponse);
    }

    public List<Movie> getTrendingMovies() {
        var response = tmdbClient.getTrendingMovies();
        List<TmdbMovieResponse> results = response != null ? response.getResults() : Collections.emptyList();
        return movieMapper.toMovies(results);
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        var response = tmdbClient.discoverMovies(genreIds, minRating, page);
        List<TmdbMovieResponse> results = response != null ? response.getResults() : Collections.emptyList();
        return movieMapper.toMovies(results);
    }

    public List<Movie> getRecommendations(int tmdbId) {
        var response = tmdbClient.getRecommendations(tmdbId);
        List<TmdbMovieResponse> results = response != null ? response.getResults() : Collections.emptyList();
        return movieMapper.toMovies(results);
    }
}
