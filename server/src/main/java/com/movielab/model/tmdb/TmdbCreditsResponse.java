package com.movielab.model.tmdb;

import java.util.List;

public class TmdbCreditsResponse {
    private List<TmdbCastResponse> cast;

    public List<TmdbCastResponse> getCast() { return cast; }
    public void setCast(List<TmdbCastResponse> cast) { this.cast = cast; }
}
