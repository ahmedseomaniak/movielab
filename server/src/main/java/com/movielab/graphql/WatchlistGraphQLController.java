package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.service.WatchlistService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class WatchlistGraphQLController {

    private final WatchlistService watchlistService;

    public WatchlistGraphQLController(WatchlistService watchlistService) {
        this.watchlistService = watchlistService;
    }

    @QueryMapping
    public List<WatchlistEntry> watchlist() {
        return watchlistService.getWatchlist();
    }

    @MutationMapping
    public WatchlistEntry addToWatchlist(@Argument int tmdbId) {
        return watchlistService.addToWatchlist(tmdbId);
    }

    @MutationMapping
    public boolean removeFromWatchlist(@Argument int tmdbId) {
        return watchlistService.removeFromWatchlist(tmdbId);
    }

    @MutationMapping
    public WatchlistEntry markWatched(@Argument int tmdbId, @Argument boolean watched) {
        return watchlistService.markWatched(tmdbId, watched);
    }

    @SchemaMapping(typeName = "WatchlistEntry", field = "movie")
    public Movie movie(WatchlistEntry entry) {
        return watchlistService.getMovieForEntry(entry);
    }
}
