package com.movielab.service;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.repository.WatchlistRepository;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class WatchlistService {

    private final WatchlistRepository repository;
    private final TmdbService tmdbService;
    private final AtomicInteger watchlistSize;

    public WatchlistService(WatchlistRepository repository, TmdbService tmdbService,
                            MeterRegistry meterRegistry) {
        this.repository = repository;
        this.tmdbService = tmdbService;
        this.watchlistSize = meterRegistry.gauge("movielab.watchlist.size",
                new AtomicInteger(0),
                AtomicInteger::get);
    }

    public WatchlistEntry addToWatchlist(int tmdbId) {
        WatchlistEntry entry;
        if (repository.existsByTmdbId(tmdbId)) {
            entry = repository.findByTmdbId(tmdbId).orElseThrow();
        } else {
            entry = repository.save(new WatchlistEntry(tmdbId));
        }
        watchlistSize.set((int) repository.count());
        return entry;
    }

    public boolean removeFromWatchlist(int tmdbId) {
        if (repository.existsByTmdbId(tmdbId)) {
            repository.deleteByTmdbId(tmdbId);
            watchlistSize.set((int) repository.count());
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
