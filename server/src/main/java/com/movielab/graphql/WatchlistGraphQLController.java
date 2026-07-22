package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.service.WatchlistService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.BatchMapping;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Controller
public class WatchlistGraphQLController {

    private final WatchlistService watchlistService;
    private final MeterRegistry meterRegistry;

    public WatchlistGraphQLController(WatchlistService watchlistService, MeterRegistry meterRegistry) {
        this.watchlistService = watchlistService;
        this.meterRegistry = meterRegistry;
    }

    @QueryMapping
    public List<WatchlistEntry> watchlist() {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return watchlistService.getWatchlist();
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "watchlist")
                    .tag("source", "database")
                    .register(meterRegistry));
        }
    }

    @MutationMapping
    public WatchlistEntry addToWatchlist(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return watchlistService.addToWatchlist(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.mutation")
                    .tag("mutation", "addToWatchlist")
                    .register(meterRegistry));
        }
    }

    @MutationMapping
    public boolean removeFromWatchlist(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return watchlistService.removeFromWatchlist(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.mutation")
                    .tag("mutation", "removeFromWatchlist")
                    .register(meterRegistry));
        }
    }

    @MutationMapping
    public WatchlistEntry markWatched(@Argument int tmdbId, @Argument boolean watched) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return watchlistService.markWatched(tmdbId, watched);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.mutation")
                    .tag("mutation", "markWatched")
                    .register(meterRegistry));
        }
    }

    @BatchMapping(typeName = "WatchlistEntry", field = "movie")
    public Map<WatchlistEntry, Movie> movie(List<WatchlistEntry> entries) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return entries.stream()
                    .collect(Collectors.toMap(
                            entry -> entry,
                            entry -> watchlistService.getMovieForEntry(entry)
                    ));
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "watchlist.movie")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }
}
