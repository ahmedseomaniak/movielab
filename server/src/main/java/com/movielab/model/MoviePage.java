package com.movielab.model;

import java.util.List;

public class MoviePage {
    private List<Movie> items;
    private PageInfo pageInfo;

    public MoviePage(List<Movie> items, PageInfo pageInfo) {
        this.items = items;
        this.pageInfo = pageInfo;
    }

    public List<Movie> getItems() { return items; }
    public PageInfo getPageInfo() { return pageInfo; }
}
