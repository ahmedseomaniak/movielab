package com.movielab.service;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WatchlistService {

    private final WatchlistRepository repository;
    private final TmdbService tmdbService;

    public WatchlistService(WatchlistRepository repository, TmdbService tmdbService) {
        this.repository = repository;
        this.tmdbService = tmdbService;
    }

    public WatchlistEntry addToWatchlist(int tmdbId) {
        if (repository.existsByTmdbId(tmdbId)) {
            return repository.findByTmdbId(tmdbId).orElseThrow();
        }
        return repository.save(new WatchlistEntry(tmdbId));
    }

    public boolean removeFromWatchlist(int tmdbId) {
        if (repository.existsByTmdbId(tmdbId)) {
            repository.deleteByTmdbId(tmdbId);
            return true;
        }
        return false;
    }

    public WatchlistEntry markWatched(int tmdbId, boolean watched) {
        WatchlistEntry entry = repository.findByTmdbId(tmdbId)
                .orElseThrow(() -> new RuntimeException("Watchlist entry not found for tmdbId: " + tmdbId));
        entry.setWatched(watched);
        return repository.save(entry);
    }

    public List<WatchlistEntry> getWatchlist() {
        return repository.findAll();
    }

    public Movie getMovieForEntry(WatchlistEntry entry) {
        return tmdbService.getMovie(entry.getTmdbId());
    }
}
