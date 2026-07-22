package com.movielab.graphql;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.MoviePage;
import com.movielab.model.PageInfo;
import com.movielab.service.TmdbService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.graphql.tester.AutoConfigureGraphQlTester;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.graphql.test.tester.GraphQlTester;
import org.springframework.boot.test.mock.mockito.MockBean;

import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.when;

@SpringBootTest
@AutoConfigureGraphQlTester
class MovieGraphQLControllerTest {

    @Autowired
    private GraphQlTester graphQlTester;

    @MockBean
    private TmdbService tmdbService;

    @Test
    void trendingMoviesShouldReturnResults() {
        when(tmdbService.getTrendingMovies()).thenReturn(List.of(
                new Movie(550, "Fight Club", "Test overview", "/poster.jpg", null, "1999-10-15", 8.4, List.of("Drama"), List.of(new CastMember("Brad Pitt", "Tyler Durden", "/profile.jpg")), 139)
        ));

        graphQlTester.documentName("movie-queries")
                .operationName("TrendingMovies")
                .execute()
                .path("trendingMovies")
                .entityList(Object.class)
                .hasSize(1);
    }

    @Test
    void searchMoviesShouldReturnResults() {
        var movie = new Movie(550, "Fight Club", "Test overview", "/poster.jpg", null, "1999-10-15", 8.4, List.of("Drama"), List.of(), 0);
        when(tmdbService.searchMovies("Fight", 1)).thenReturn(
                new MoviePage(List.of(movie), new PageInfo(1, 1))
        );

        graphQlTester.documentName("movie-queries")
                .operationName("SearchMovies")
                .variable("query", "Fight")
                .variable("page", 1)
                .execute()
                .path("searchMovies.items")
                .entityList(Object.class)
                .hasSize(1);
    }
}
