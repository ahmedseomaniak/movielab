package com.movielab.graphql;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.service.TmdbService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureGraphQlTester
class WatchlistGraphQLControllerTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockBean
    private TmdbService tmdbService;

    @Test
    void addToWatchlistShouldReturnEntry() {
        when(tmdbService.getMovie(anyInt())).thenReturn(
                new Movie(550, "Fight Club", "Test", "/poster.jpg", null, "1999-10-15", 8.4, List.of("Drama"), List.of(), 139)
        );

        graphQlTester.document("""
                mutation Add($tmdbId: Int!) {
                    addToWatchlist(tmdbId: $tmdbId) {
                        id
                        movie { tmdbId title }
                        watched
                    }
                }
                """)
                .variable("tmdbId", 550)
                .execute()
                .path("addToWatchlist.id")
                .entity(String.class)
                .matches(s -> s != null && !s.isEmpty());
    }

    @Test
    void watchlistShouldContainAddedMovie() {
        when(tmdbService.getMovie(anyInt())).thenReturn(
                new Movie(550, "Fight Club", "Test", "/poster.jpg", null, "1999-10-15", 8.4, List.of("Drama"), List.of(), 139)
        );

        graphQlTester.document("""
                mutation Add($tmdbId: Int!) {
                    addToWatchlist(tmdbId: $tmdbId) { id movie { tmdbId } }
                }
                """)
                .variable("tmdbId", 550)
                .execute();

        graphQlTester.document("""
                query Watchlist {
                    watchlist { movie { tmdbId } }
                }
                """)
                .execute()
                .path("watchlist[*].movie.tmdbId")
                .entityList(Integer.class)
                .contains(550);
    }

    @Test
    void markWatchedShouldToggleStatus() {
        when(tmdbService.getMovie(anyInt())).thenReturn(
                new Movie(551, "Inception", "Test", "/poster.jpg", null, "2010-07-16", 8.8, List.of("Sci-Fi"), List.of(), 148)
        );

        graphQlTester.document("""
                mutation Add($tmdbId: Int!) {
                    addToWatchlist(tmdbId: $tmdbId) { id movie { tmdbId } }
                }
                """)
                .variable("tmdbId", 551)
                .execute();

        graphQlTester.document("""
                mutation Mark($tmdbId: Int!, $watched: Boolean!) {
                    markWatched(tmdbId: $tmdbId, watched: $watched) { watched }
                }
                """)
                .variable("tmdbId", 551)
                .variable("watched", true)
                .execute()
                .path("markWatched.watched")
                .entity(Boolean.class)
                .isEqualTo(true);
    }
}
