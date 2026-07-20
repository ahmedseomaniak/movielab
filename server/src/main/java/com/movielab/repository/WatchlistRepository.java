package com.movielab.repository;

import com.movielab.model.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {
    Optional<WatchlistEntry> findByTmdbId(int tmdbId);
    boolean existsByTmdbId(int tmdbId);
    void deleteByTmdbId(int tmdbId);
}
