package com.movielab.model;

import java.util.List;

public class Movie {
    private int tmdbId;
    private String title;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String releaseDate;
    private double voteAverage;
    private List<String> genres;
    private List<CastMember> cast;
    private int runtime;

    public Movie(int tmdbId, String title, String overview, String posterUrl,
                 String backdropUrl, String releaseDate, double voteAverage,
                 List<String> genres, List<CastMember> cast, int runtime) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.overview = overview;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.releaseDate = releaseDate;
        this.voteAverage = voteAverage;
        this.genres = genres;
        this.cast = cast;
        this.runtime = runtime;
    }

    public int getTmdbId() { return tmdbId; }
    public String getTitle() { return title; }
    public String getOverview() { return overview; }
    public String getPosterUrl() { return posterUrl; }
    public String getBackdropUrl() { return backdropUrl; }
    public String getReleaseDate() { return releaseDate; }
    public double getVoteAverage() { return voteAverage; }
    public List<String> getGenres() { return genres; }
    public List<CastMember> getCast() { return cast; }
    public int getRuntime() { return runtime; }
}
