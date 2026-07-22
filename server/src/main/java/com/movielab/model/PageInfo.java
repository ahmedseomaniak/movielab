package com.movielab.model;

public class PageInfo {
    private int currentPage;
    private int totalPages;

    public PageInfo(int currentPage, int totalPages) {
        this.currentPage = currentPage;
        this.totalPages = totalPages;
    }

    public int getCurrentPage() { return currentPage; }
    public int getTotalPages() { return totalPages; }
}
