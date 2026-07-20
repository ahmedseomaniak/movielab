package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbSearchResponse {
    private int page;
    private List<TmdbMovieResponse> results;
    @JsonProperty("total_pages")
    private int totalPages;

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public List<TmdbMovieResponse> getResults() { return results; }
    public void setResults(List<TmdbMovieResponse> results) { this.results = results; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}
