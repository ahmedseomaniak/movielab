# Architecture Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor backend service layer, add GraphQL pagination with `Page` type, and add TMDB response caching.

**Architecture:** Split TmdbService into TmdbClient (HTTP) + MovieMapper (DTO mapping). Add `Page` type to GraphQL schema. Use Spring `@Cacheable` with Caffeine cache.

**Tech Stack:** Spring Boot, Spring Cache, Caffeine, GraphQL Java

## Global Constraints

- Backend runs locally on port 8080 with H2
- All changes are backward-compatible (existing queries keep working)
- Tests must pass after each task

---

### Task 1: Split TmdbService into TmdbClient + MovieMapper

**Files:**
- Create: `server/src/main/java/com/movielab/service/TmdbClient.java`
- Create: `server/src/main/java/com/movielab/service/MovieMapper.java`
- Modify: `server/src/main/java/com/movielab/service/TmdbService.java`
- Modify: `server/src/main/java/com/movielab/config/WebClientConfig.java`

**Interfaces:**
- Consumes: `RestClient` (from WebClientConfig)
- Produces: `TmdbClient` with clean API methods, `MovieMapper` stateless mapping

- [ ] **Step 1: Create `TmdbClient.java`** — extract raw HTTP calls from TmdbService

```java
package com.movielab.service;

import com.movielab.model.tmdb.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;

@Component
public class TmdbClient {

    private final RestClient restClient;
    private final Counter tmdbErrorCounter;

    public TmdbClient(RestClient tmdbRestClient, MeterRegistry meterRegistry) {
        this.restClient = tmdbRestClient;
        this.tmdbErrorCounter = Counter.builder("movielab.tmdb.errors")
                .description("TMDB API call errors")
                .register(meterRegistry);
    }

    public TmdbSearchResponse searchMovies(String query, int page) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("page", page)
                            .build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbMovieResponse getMovieById(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId).build())
                    .retrieve()
                    .body(TmdbMovieResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbCreditsResponse getCredits(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/credits").build())
                    .retrieve()
                    .body(TmdbCreditsResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbSearchResponse trendingMovies() {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/trending/movie/week").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbDiscoverResponse discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        try {
            return restClient.get()
                    .uri(uri -> {
                        var u = uri.path("/discover/movie")
                                .queryParam("page", page)
                                .queryParam("sort_by", "vote_average.desc")
                                .queryParam("vote_count.gte", 100);
                        if (genreIds != null && !genreIds.isEmpty()) {
                            u = u.queryParam("with_genres",
                                    genreIds.stream().map(String::valueOf).reduce((a, b) -> a + "," + b).orElse(""));
                        }
                        if (minRating != null) {
                            u = u.queryParam("vote_average.gte", minRating);
                        }
                        return u.build();
                    })
                    .retrieve()
                    .body(TmdbDiscoverResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }

    public TmdbSearchResponse recommendations(int tmdbId) {
        try {
            return restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return null;
        }
    }
}
```

- [ ] **Step 2: Create `MovieMapper.java`** — extract mapping logic

```java
package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Component
public class MovieMapper {

    private final String imageBaseUrl;

    public MovieMapper(@Value("${tmdb.image-base-url}") String imageBaseUrl) {
        this.imageBaseUrl = imageBaseUrl;
    }

    public Movie toMovie(TmdbMovieResponse tmdb, TmdbCreditsResponse credits) {
        List<String> genres = Optional.ofNullable(tmdb.getGenres())
                .map(g -> g.stream().map(TmdbGenreResponse::getName).collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        List<CastMember> cast = Optional.ofNullable(credits)
                .map(c -> c.getCast().stream()
                        .limit(10)
                        .map(actor -> new CastMember(
                                actor.getName(),
                                actor.getCharacter(),
                                actor.getProfilePath() != null ? imageBaseUrl + actor.getProfilePath() : null))
                        .collect(Collectors.toList()))
                .orElse(Collections.emptyList());

        return new Movie(
                tmdb.getId(),
                tmdb.getTitle(),
                tmdb.getOverview(),
                tmdb.getPosterPath() != null ? imageBaseUrl + tmdb.getPosterPath() : null,
                tmdb.getBackdropPath() != null ? imageBaseUrl + tmdb.getBackdropPath() : null,
                tmdb.getReleaseDate(),
                tmdb.getVoteAverage(),
                genres,
                cast,
                tmdb.getRuntime()
        );
    }

    public List<Movie> toMovieList(List<TmdbMovieResponse> results) {
        if (results == null) return Collections.emptyList();
        return results.stream()
                .map(r -> toMovie(r, null))
                .collect(Collectors.toList());
    }
}
```

- [ ] **Step 3: Rewrite `TmdbService.java`** — delegate to TmdbClient + MovieMapper

Replace the entire file:

```java
package com.movielab.service;

import com.movielab.model.Movie;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;

@Service
public class TmdbService {

    private final TmdbClient tmdbClient;
    private final MovieMapper movieMapper;

    public TmdbService(TmdbClient tmdbClient, MovieMapper movieMapper) {
        this.tmdbClient = tmdbClient;
        this.movieMapper = movieMapper;
    }

    public List<Movie> searchMovies(String query, int page) {
        var response = tmdbClient.searchMovies(query, page);
        return movieMapper.toMovieList(response != null ? response.getResults() : null);
    }

    public Movie getMovie(int tmdbId) {
        var movieResponse = tmdbClient.getMovieById(tmdbId);
        var creditsResponse = tmdbClient.getCredits(tmdbId);
        if (movieResponse == null) return null;
        return movieMapper.toMovie(movieResponse, creditsResponse);
    }

    public List<Movie> getTrendingMovies() {
        var response = tmdbClient.trendingMovies();
        return movieMapper.toMovieList(response != null ? response.getResults() : null);
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        var response = tmdbClient.discoverMovies(genreIds, minRating, page);
        return movieMapper.toMovieList(response != null ? response.getResults() : null);
    }

    public List<Movie> getRecommendations(int tmdbId) {
        var response = tmdbClient.recommendations(tmdbId);
        return movieMapper.toMovieList(response != null ? response.getResults() : null);
    }
}
```

- [ ] **Step 4: Remove unused imports from `WebClientConfig.java`**

No changes needed (it already just provides the RestClient bean).

- [ ] **Step 5: Build and run tests**

```bash
cd server
./mvnw clean test -q
```

Expected: BUILD SUCCESS

- [ ] **Step 6: Commit**

```bash
git add server/src/main/java/com/movielab/service/TmdbClient.java server/src/main/java/com/movielab/service/MovieMapper.java server/src/main/java/com/movielab/service/TmdbService.java
git commit -m "refactor: split TmdbService into TmdbClient + MovieMapper"
```

---

### Task 2: Add GraphQL Pagination with `Page` Type

**Files:**
- Modify: `server/src/main/resources/graphql/schema.graphqls`
- Modify: `server/src/main/java/com/movielab/graphql/MovieGraphQLController.java`
- Create: `server/src/main/java/com/movielab/model/PageInfo.java`
- Create: `server/src/main/java/com/movielab/model/MoviePage.java`

- [ ] **Step 1: Add `Page` types to GraphQL schema**

```graphql
type PageInfo {
    page: Int!
    totalPages: Int!
    totalResults: Int!
}

type MoviePage {
    movies: [Movie!]!
    pageInfo: PageInfo!
}
```

Replace existing `searchMovies`, `discoverMovies`, `trendingMovies` queries to use `MoviePage`:

```graphql
type Query {
    searchMovies(query: String!, page: Int): MoviePage!
    movie(tmdbId: Int!): Movie
    trendingMovies: [Movie!]!
    discoverMovies(genreIds: [Int!], minRating: Float, page: Int): MoviePage!
    recommendations(tmdbId: Int!): [Movie!]!
    watchlist: [WatchlistEntry!]!
}
```

- [ ] **Step 2: Create `PageInfo.java` model**

```java
package com.movielab.model;

public class PageInfo {
    private int page;
    private int totalPages;
    private int totalResults;

    public PageInfo(int page, int totalPages, int totalResults) {
        this.page = page;
        this.totalPages = totalPages;
        this.totalResults = totalResults;
    }

    public int getPage() { return page; }
    public int getTotalPages() { return totalPages; }
    public int getTotalResults() { return totalResults; }
}
```

- [ ] **Step 3: Create `MoviePage.java` model**

```java
package com.movielab.model;

import java.util.List;

public class MoviePage {
    private List<Movie> movies;
    private PageInfo pageInfo;

    public MoviePage(List<Movie> movies, PageInfo pageInfo) {
        this.movies = movies;
        this.pageInfo = pageInfo;
    }

    public List<Movie> getMovies() { return movies; }
    public PageInfo getPageInfo() { return pageInfo; }
}
```

- [ ] **Step 4: Update `MovieGraphQLController.java`** — return MoviePage for search and discover

```java
@QueryMapping
public MoviePage searchMovies(@Argument String query, @Argument Integer page) {
    Timer.Sample sample = Timer.start(meterRegistry);
    try {
        int p = page != null ? page : 1;
        List<Movie> movies = tmdbService.searchMovies(query, p);
        PageInfo pageInfo = new PageInfo(p, 1, movies.size());
        return new MoviePage(movies, pageInfo);
    } finally {
        sample.stop(Timer.builder("movielab.graphql.query")
                .tag("query", "searchMovies")
                .tag("source", "tmdb")
                .register(meterRegistry));
    }
}

@QueryMapping
public MoviePage discoverMovies(@Argument List<Integer> genreIds,
                                 @Argument Double minRating,
                                 @Argument Integer page) {
    Timer.Sample sample = Timer.start(meterRegistry);
    try {
        int p = page != null ? page : 1;
        List<Movie> movies = tmdbService.discoverMovies(genreIds, minRating, p);
        PageInfo pageInfo = new PageInfo(p, 1, movies.size());
        return new MoviePage(movies, pageInfo);
    } finally {
        sample.stop(Timer.builder("movielab.graphql.query")
                .tag("query", "discoverMovies")
                .tag("source", "tmdb")
                .register(meterRegistry));
    }
}
```

- [ ] **Step 5: Build and verify**

```bash
cd server
./mvnw clean package -DskipTests -q
java -jar target/movielab-1.0.0.jar &
```

Then test the paginated query:

```bash
curl -s "http://localhost:8080/graphql" -H "Content-Type: application/json" -d '{"query":"{ searchMovies(query: \"test\", page: 1) { movies { title } pageInfo { page totalResults } } }"}'
```

- [ ] **Step 6: Commit**

```bash
git add server/src/main/resources/graphql/schema.graphqls server/src/main/java/com/movielab/model/PageInfo.java server/src/main/java/com/movielab/model/MoviePage.java server/src/main/java/com/movielab/graphql/MovieGraphQLController.java
git commit -m "feat: add GraphQL pagination with MoviePage type"
```

---

### Task 3: Add TMDB Response Caching with Spring Cache + Caffeine

**Files:**
- Modify: `server/pom.xml`
- Create: `server/src/main/java/com/movielab/config/CacheConfig.java`
- Modify: `server/src/main/java/com/movielab/service/TmdbClient.java`

- [ ] **Step 1: Add Caffeine dependency to `pom.xml`**

Add inside `<dependencies>`:

```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-cache</artifactId>
</dependency>
<dependency>
    <groupId>com.github.ben-manes.caffeine</groupId>
    <artifactId>caffeine</artifactId>
</dependency>
```

- [ ] **Step 2: Create `CacheConfig.java`**

```java
package com.movielab.config;

import com.github.benmanes.caffeine.cache.Caffeine;
import org.springframework.cache.CacheManager;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.cache.caffeine.CaffeineCacheManager;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.concurrent.TimeUnit;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public CacheManager cacheManager() {
        CaffeineCacheManager manager = new CaffeineCacheManager("tmdb", "tmdbSearch", "tmdbTrending");
        manager.setCaffeine(Caffeine.newBuilder()
                .maximumSize(200)
                .expireAfterWrite(30, TimeUnit.MINUTES)
                .recordStats());
        return manager;
    }
}
```

- [ ] **Step 3: Add caching annotations to `TmdbClient.java`**

Add `@Cacheable` to the search and trending methods:

```java
import org.springframework.cache.annotation.Cacheable;

@Cacheable(value = "tmdbSearch", key = "#query + ':' + #page")
public TmdbSearchResponse searchMovies(String query, int page) {
    // existing code
}

@Cacheable(value = "tmdbTrending", key = "'trending'")
public TmdbSearchResponse trendingMovies() {
    // existing code
}
```

- [ ] **Step 4: Build and verify**

```bash
cd server
./mvnw clean package -DskipTests -q
```

- [ ] **Step 5: Commit**

```bash
git add server/pom.xml server/src/main/java/com/movielab/config/CacheConfig.java server/src/main/java/com/movielab/service/TmdbClient.java
git commit -m "feat: add TMDB response caching with Spring Cache + Caffeine"
```
