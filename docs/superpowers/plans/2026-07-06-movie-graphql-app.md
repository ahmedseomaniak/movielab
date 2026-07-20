# Movie GraphQL App Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a movie browsing app with Spring Boot GraphQL backend, React+Apollo Client frontend, and TMDB API integration

**Architecture:** Spring Boot serves GraphQL, proxies TMDB API for movie data, manages watchlists in H2 via JPA. React frontend uses Apollo Client to query/mutate through GraphQL.

**Tech Stack:** Spring Boot 3, spring-graphql, WebClient, JPA/H2, React 18, TypeScript, Apollo Client, Vite

---

### Task 1: Scaffold Spring Boot Project

**Files:**
- Create: `server/pom.xml`
- Create: `server/src/main/resources/application.properties`
- Create: `server/src/main/java/com/movielab/MovielabApplication.java`

- [ ] **Step 1: Create pom.xml**

```xml
<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.0</version>
    </parent>
    <groupId>com.movielab</groupId>
    <artifactId>movielab</artifactId>
    <version>1.0.0</version>
    <properties>
        <java.version>17</java.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-graphql</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>com.h2database</groupId>
            <artifactId>h2</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.springframework.graphql</groupId>
            <artifactId>spring-graphql-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>
```

- [ ] **Step 2: Create application.properties**

```
spring.application.name=movielab
server.port=8080
spring.graphql.graphiql.enabled=true
spring.datasource.url=jdbc:h2:file:./data/movielab
spring.datasource.driver-class-name=org.h2.Driver
spring.jpa.hibernate.ddl-auto=update
tmdb.api.key=${TMDB_API_KEY}
tmdb.api.base-url=https://api.themoviedb.org/3
tmdb.image-base-url=https://image.tmdb.org/t/p/w500
```

- [ ] **Step 3: Create main application class**

```java
package com.movielab;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class MovielabApplication {
    public static void main(String[] args) {
        SpringApplication.run(MovielabApplication.class, args);
    }
}
```

- [ ] **Step 4: Create directory structure for all packages**

Run: `mkdir -p server/src/main/java/com/movielab/{config,model/tmdb,repository,service,graphql} && mkdir -p server/src/main/resources/graphql && mkdir -p server/src/test/java/com/movielab && mkdir -p server/data`

- [ ] **Step 5: Commit**

```bash
git add server/
git commit -m "chore: scaffold Spring Boot project"
```

---

### Task 2: Create WebClient Config

**Files:**
- Create: `server/src/main/java/com/movielab/config/WebClientConfig.java`

- [ ] **Step 1: Write WebClientConfig**

```java
package com.movielab.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Value("${tmdb.api.base-url}")
    private String tmdbBaseUrl;

    @Bean
    public WebClient tmdbWebClient(WebClient.Builder builder) {
        return builder.baseUrl(tmdbBaseUrl).build();
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/main/java/com/movielab/config/WebClientConfig.java
git commit -m "feat: add WebClient config for TMDB API"
```

---

### Task 3: Create TMDB Response DTOs

**Files:**
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbMovieResponse.java`
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbCastResponse.java`
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbCreditsResponse.java`
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbSearchResponse.java`
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbGenreResponse.java`
- Create: `server/src/main/java/com/movielab/model/tmdb/TmdbDiscoverResponse.java`

- [ ] **Step 1: Create TmdbMovieResponse.java**

```java
package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbMovieResponse {
    private int id;
    private String title;
    private String overview;
    @JsonProperty("poster_path")
    private String posterPath;
    @JsonProperty("backdrop_path")
    private String backdropPath;
    @JsonProperty("release_date")
    private String releaseDate;
    @JsonProperty("vote_average")
    private double voteAverage;
    @JsonProperty("genre_ids")
    private List<Integer> genreIds;
    private List<TmdbGenreResponse> genres;
    private int runtime;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getOverview() { return overview; }
    public void setOverview(String overview) { this.overview = overview; }
    public String getPosterPath() { return posterPath; }
    public void setPosterPath(String posterPath) { this.posterPath = posterPath; }
    public String getBackdropPath() { return backdropPath; }
    public void setBackdropPath(String backdropPath) { this.backdropPath = backdropPath; }
    public String getReleaseDate() { return releaseDate; }
    public void setReleaseDate(String releaseDate) { this.releaseDate = releaseDate; }
    public double getVoteAverage() { return voteAverage; }
    public void setVoteAverage(double voteAverage) { this.voteAverage = voteAverage; }
    public List<Integer> getGenreIds() { return genreIds; }
    public void setGenreIds(List<Integer> genreIds) { this.genreIds = genreIds; }
    public List<TmdbGenreResponse> getGenres() { return genres; }
    public void setGenres(List<TmdbGenreResponse> genres) { this.genres = genres; }
    public int getRuntime() { return runtime; }
    public void setRuntime(int runtime) { this.runtime = runtime; }
}
```

- [ ] **Step 2: Create TmdbCastResponse.java**

```java
package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;

public class TmdbCastResponse {
    private String name;
    private String character;
    @JsonProperty("profile_path")
    private String profilePath;

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getCharacter() { return character; }
    public void setCharacter(String character) { this.character = character; }
    public String getProfilePath() { return profilePath; }
    public void setProfilePath(String profilePath) { this.profilePath = profilePath; }
}
```

- [ ] **Step 3: Create TmdbCreditsResponse.java**

```java
package com.movielab.model.tmdb;

import java.util.List;

public class TmdbCreditsResponse {
    private List<TmdbCastResponse> cast;

    public List<TmdbCastResponse> getCast() { return cast; }
    public void setCast(List<TmdbCastResponse> cast) { this.cast = cast; }
}
```

- [ ] **Step 4: Create TmdbSearchResponse.java**

```java
package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbSearchResponse {
    private int page;
    private List<TmdbMovieResponse> results;
    @JsonProperty("total_pages")
    private int totalPages;

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public List<TmdbMovieResponse> getResults() { return results; }
    public void setResults(List<TmdbMovieResponse> results) { this.results = results; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}
```

- [ ] **Step 5: Create TmdbGenreResponse.java**

```java
package com.movielab.model.tmdb;

public class TmdbGenreResponse {
    private int id;
    private String name;

    public int getId() { return id; }
    public void setId(int id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
```

- [ ] **Step 6: Create TmdbDiscoverResponse.java**

Same structure as TmdbSearchResponse (page, results, total_pages). These can share the same structure.

```java
package com.movielab.model.tmdb;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class TmdbDiscoverResponse {
    private int page;
    private List<TmdbMovieResponse> results;
    @JsonProperty("total_pages")
    private int totalPages;

    public int getPage() { return page; }
    public void setPage(int page) { this.page = page; }
    public List<TmdbMovieResponse> getResults() { return results; }
    public void setResults(List<TmdbMovieResponse> results) { this.results = results; }
    public int getTotalPages() { return totalPages; }
    public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
}
```

- [ ] **Step 7: Commit**

```bash
git add server/src/main/java/com/movielab/model/
git commit -m "feat: add TMDB API response DTOs"
```

---

### Task 4: Create GraphQL Model Types

**Files:**
- Create: `server/src/main/java/com/movielab/model/Movie.java`
- Create: `server/src/main/java/com/movielab/model/CastMember.java`

- [ ] **Step 1: Create Movie.java**

```java
package com.movielab.model;

import java.util.List;

public class Movie {
    private int tmdbId;
    private String title;
    private String overview;
    private String posterUrl;
    private String backdropUrl;
    private String releaseDate;
    private double voteAverage;
    private List<String> genres;
    private List<CastMember> cast;
    private int runtime;

    public Movie(int tmdbId, String title, String overview, String posterUrl,
                 String backdropUrl, String releaseDate, double voteAverage,
                 List<String> genres, List<CastMember> cast, int runtime) {
        this.tmdbId = tmdbId;
        this.title = title;
        this.overview = overview;
        this.posterUrl = posterUrl;
        this.backdropUrl = backdropUrl;
        this.releaseDate = releaseDate;
        this.voteAverage = voteAverage;
        this.genres = genres;
        this.cast = cast;
        this.runtime = runtime;
    }

    public int getTmdbId() { return tmdbId; }
    public String getTitle() { return title; }
    public String getOverview() { return overview; }
    public String getPosterUrl() { return posterUrl; }
    public String getBackdropUrl() { return backdropUrl; }
    public String getReleaseDate() { return releaseDate; }
    public double getVoteAverage() { return voteAverage; }
    public List<String> getGenres() { return genres; }
    public List<CastMember> getCast() { return cast; }
    public int getRuntime() { return runtime; }
}
```

- [ ] **Step 2: Create CastMember.java**

```java
package com.movielab.model;

public class CastMember {
    private String name;
    private String character;
    private String profileUrl;

    public CastMember(String name, String character, String profileUrl) {
        this.name = name;
        this.character = character;
        this.profileUrl = profileUrl;
    }

    public String getName() { return name; }
    public String getCharacter() { return character; }
    public String getProfileUrl() { return profileUrl; }
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/main/java/com/movielab/model/Movie.java server/src/main/java/com/movielab/model/CastMember.java
git commit -m "feat: add GraphQL model types"
```

---

### Task 5: Create JPA Entity and Repository

**Files:**
- Create: `server/src/main/java/com/movielab/model/WatchlistEntry.java`
- Create: `server/src/main/java/com/movielab/repository/WatchlistRepository.java`

- [ ] **Step 1: Create WatchlistEntry.java**

```java
package com.movielab.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import java.time.LocalDateTime;

@Entity
public class WatchlistEntry {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private int tmdbId;
    private boolean watched;
    private LocalDateTime addedAt;

    public WatchlistEntry() {}

    public WatchlistEntry(int tmdbId) {
        this.tmdbId = tmdbId;
        this.watched = false;
        this.addedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public int getTmdbId() { return tmdbId; }
    public void setTmdbId(int tmdbId) { this.tmdbId = tmdbId; }
    public boolean isWatched() { return watched; }
    public void setWatched(boolean watched) { this.watched = watched; }
    public LocalDateTime getAddedAt() { return addedAt; }
    public void setAddedAt(LocalDateTime addedAt) { this.addedAt = addedAt; }
}
```

- [ ] **Step 2: Create WatchlistRepository.java**

```java
package com.movielab.repository;

import com.movielab.model.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface WatchlistRepository extends JpaRepository<WatchlistEntry, Long> {
    Optional<WatchlistEntry> findByTmdbId(int tmdbId);
    boolean existsByTmdbId(int tmdbId);
    void deleteByTmdbId(int tmdbId);
}
```

- [ ] **Step 3: Commit**

```bash
git add server/src/main/java/com/movielab/model/WatchlistEntry.java server/src/main/java/com/movielab/repository/
git commit -m "feat: add WatchlistEntry entity and JPA repository"
```

---

### Task 6: Create GraphQL Schema

**Files:**
- Create: `server/src/main/resources/graphql/schema.graphqls`

- [ ] **Step 1: Write the schema**

```graphql
type Movie {
    id: ID!
    tmdbId: Int!
    title: String!
    overview: String
    posterUrl: String
    backdropUrl: String
    releaseDate: String
    voteAverage: Float
    genres: [String!]
    cast: [CastMember!]
    runtime: Int
}

type CastMember {
    name: String!
    character: String!
    profileUrl: String
}

type WatchlistEntry {
    id: ID!
    movie: Movie!
    watched: Boolean!
    addedAt: String!
}

type Query {
    searchMovies(query: String!, page: Int): [Movie!]!
    movie(tmdbId: Int!): Movie
    trendingMovies: [Movie!]!
    discoverMovies(genreIds: [Int!], minRating: Float, page: Int): [Movie!]!
    recommendations(tmdbId: Int!): [Movie!]!
    watchlist: [WatchlistEntry!]!
}

type Mutation {
    addToWatchlist(tmdbId: Int!): WatchlistEntry!
    removeFromWatchlist(tmdbId: Int!): Boolean!
    markWatched(tmdbId: Int!, watched: Boolean!): WatchlistEntry!
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/main/resources/graphql/schema.graphqls
git commit -m "feat: add GraphQL schema"
```

---

### Task 7: Implement TmdbService

**Files:**
- Create: `server/src/main/java/com/movielab/service/TmdbService.java`

- [ ] **Step 1: Write TmdbService.java**

```java
package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private final WebClient webClient;
    private final String apiKey;
    private final String imageBaseUrl;

    public TmdbService(WebClient tmdbWebClient,
                       @Value("${tmdb.api.key}") String apiKey,
                       @Value("${tmdb.image-base-url}") String imageBaseUrl) {
        this.webClient = tmdbWebClient;
        this.apiKey = apiKey;
        this.imageBaseUrl = imageBaseUrl;
    }

    public List<Movie> searchMovies(String query, int page) {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/search/movie")
                        .queryParam("api_key", apiKey)
                        .queryParam("query", query)
                        .queryParam("page", page)
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public Movie getMovie(int tmdbId) {
        Mono<TmdbMovieResponse> movieMono = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId)
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TmdbMovieResponse.class);

        Mono<TmdbCreditsResponse> creditsMono = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId + "/credits")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TmdbCreditsResponse.class);

        return Mono.zip(movieMono, creditsMono)
                .map(tuple -> {
                    TmdbMovieResponse movie = tuple.getT1();
                    TmdbCreditsResponse credits = tuple.getT2();
                    return mapToMovie(movie, credits);
                })
                .block();
    }

    public List<Movie> getTrendingMovies() {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/trending/movie/week")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        TmdbDiscoverResponse response = webClient.get()
                .uri(uri -> {
                    var u = uri.path("/discover/movie")
                            .queryParam("api_key", apiKey)
                            .queryParam("page", page)
                            .queryParam("sort_by", "vote_average.desc")
                            .queryParam("vote_count.gte", 100);
                    if (genreIds != null && !genreIds.isEmpty()) {
                        u = u.queryParam("with_genres",
                                genreIds.stream().map(String::valueOf).collect(Collectors.joining(",")));
                    }
                    if (minRating != null) {
                        u = u.queryParam("vote_average.gte", minRating);
                    }
                    return u.build();
                })
                .retrieve()
                .bodyToMono(TmdbDiscoverResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    public List<Movie> getRecommendations(int tmdbId) {
        TmdbSearchResponse response = webClient.get()
                .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations")
                        .queryParam("api_key", apiKey)
                        .build())
                .retrieve()
                .bodyToMono(TmdbSearchResponse.class)
                .block();
        return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
    }

    private Movie mapToMovie(TmdbMovieResponse tmdb, TmdbCreditsResponse credits) {
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

    private Movie mapToMovieSimple(TmdbMovieResponse tmdb) {
        return mapToMovie(tmdb, null);
    }

    private List<Movie> mapToMovies(List<TmdbMovieResponse> results) {
        return results.stream().map(this::mapToMovieSimple).collect(Collectors.toList());
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/main/java/com/movielab/service/TmdbService.java
git commit -m "feat: implement TmdbService with WebClient calls"
```

---

### Task 8: Implement WatchlistService

**Files:**
- Create: `server/src/main/java/com/movielab/service/WatchlistService.java`

- [ ] **Step 1: Write WatchlistService.java**

```java
package com.movielab.service;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.repository.WatchlistRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

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

    public WatchlistEntry getEntryWithMovie(WatchlistEntry entry) {
        return entry;
    }

    public Movie getMovieForEntry(WatchlistEntry entry) {
        return tmdbService.getMovie(entry.getTmdbId());
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add server/src/main/java/com/movielab/service/WatchlistService.java
git commit -m "feat: implement WatchlistService"
```

---

### Task 9: Implement GraphQL Controllers

**Files:**
- Create: `server/src/main/java/com/movielab/graphql/MovieGraphQLController.java`
- Create: `server/src/main/java/com/movielab/graphql/WatchlistGraphQLController.java`

- [ ] **Step 1: Write MovieGraphQLController.java**

```java
package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.service.TmdbService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class MovieGraphQLController {

    private final TmdbService tmdbService;

    public MovieGraphQLController(TmdbService tmdbService) {
        this.tmdbService = tmdbService;
    }

    @QueryMapping
    public List<Movie> searchMovies(@Argument String query, @Argument Integer page) {
        return tmdbService.searchMovies(query, page != null ? page : 1);
    }

    @QueryMapping
    public Movie movie(@Argument int tmdbId) {
        return tmdbService.getMovie(tmdbId);
    }

    @QueryMapping
    public List<Movie> trendingMovies() {
        return tmdbService.getTrendingMovies();
    }

    @QueryMapping
    public List<Movie> discoverMovies(@Argument List<Integer> genreIds,
                                       @Argument Double minRating,
                                       @Argument Integer page) {
        return tmdbService.discoverMovies(genreIds, minRating, page != null ? page : 1);
    }

    @QueryMapping
    public List<Movie> recommendations(@Argument int tmdbId) {
        return tmdbService.getRecommendations(tmdbId);
    }
}
```

- [ ] **Step 2: Write WatchlistGraphQLController.java**

```java
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
```

- [ ] **Step 3: Commit**

```bash
git add server/src/main/java/com/movielab/graphql/
git commit -m "feat: implement GraphQL controllers"
```

---

### Task 10: Scaffold React Project

**Files:**
- Create: `client/package.json`
- Create: `client/tsconfig.json`
- Create: `client/vite.config.ts`
- Create: `client/index.html`
- Create: `client/src/main.tsx`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "movielab-client",
  "private": true,
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "react-router-dom": "^6.23.0",
    "@apollo/client": "^3.10.0",
    "graphql": "^16.8.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.4.0",
    "vite": "^5.2.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src"]
}
```

- [ ] **Step 3: Create vite.config.ts**

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
```

- [ ] **Step 4: Create index.html**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>MovieLab</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create src/main.tsx**

```tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
```

- [ ] **Step 6: Commit**

```bash
git add client/
git commit -m "chore: scaffold React project with Vite"
```

---

### Task 11: Create Apollo Client Setup

**Files:**
- Create: `client/src/apolloClient.ts`
- Create: `client/src/App.tsx`

- [ ] **Step 1: Create apolloClient.ts**

```ts
import { ApolloClient, InMemoryCache } from '@apollo/client';

export const client = new ApolloClient({
  uri: 'http://localhost:8080/graphql',
  cache: new InMemoryCache(),
});
```

- [ ] **Step 2: Create App.tsx**

```tsx
import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { client } from './apolloClient';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import WatchlistPage from './pages/WatchlistPage';
import DiscoverPage from './pages/DiscoverPage';

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <nav style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link to="/">Home</Link>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/discover">Discover</Link>
        </nav>
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:tmdbId" element={<MoviePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
```

- [ ] **Step 3: Commit**

```bash
git add client/src/apolloClient.ts client/src/App.tsx
git commit -m "feat: add Apollo Client and app routing"
```

---

### Task 12: Create GraphQL Operation Files

**Files:**
- Create: `client/src/graphql/queries.graphql`
- Create: `client/src/graphql/mutations.graphql`

- [ ] **Step 1: Create queries.graphql**

```graphql
query SearchMovies($query: String!, $page: Int) {
  searchMovies(query: $query, page: $page) {
    tmdbId
    title
    posterUrl
    releaseDate
    voteAverage
    genres
  }
}

query TrendingMovies {
  trendingMovies {
    tmdbId
    title
    posterUrl
    releaseDate
    voteAverage
    genres
  }
}

query Movie($tmdbId: Int!) {
  movie(tmdbId: $tmdbId) {
    tmdbId
    title
    overview
    posterUrl
    backdropUrl
    releaseDate
    voteAverage
    genres
    runtime
    cast {
      name
      character
      profileUrl
    }
  }
}

query DiscoverMovies($genreIds: [Int!], $minRating: Float, $page: Int) {
  discoverMovies(genreIds: $genreIds, minRating: $minRating, page: $page) {
    tmdbId
    title
    posterUrl
    releaseDate
    voteAverage
    genres
  }
}

query Recommendations($tmdbId: Int!) {
  recommendations(tmdbId: $tmdbId) {
    tmdbId
    title
    posterUrl
    releaseDate
    voteAverage
    genres
  }
}

query Watchlist {
  watchlist {
    id
    watched
    addedAt
    movie {
      tmdbId
      title
      posterUrl
      voteAverage
      genres
    }
  }
}
```

- [ ] **Step 2: Create mutations.graphql**

```graphql
mutation AddToWatchlist($tmdbId: Int!) {
  addToWatchlist(tmdbId: $tmdbId) {
    id
    watched
    movie {
      tmdbId
      title
    }
  }
}

mutation RemoveFromWatchlist($tmdbId: Int!) {
  removeFromWatchlist(tmdbId: $tmdbId)
}

mutation MarkWatched($tmdbId: Int!, $watched: Boolean!) {
  markWatched(tmdbId: $tmdbId, watched: $watched) {
    id
    watched
    movie {
      tmdbId
      title
    }
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/graphql/
git commit -m "feat: add GraphQL query and mutation operations"
```

---

### Task 13: Create Custom Hooks

**Files:**
- Create: `client/src/hooks/useMovies.ts`
- Create: `client/src/hooks/useWatchlist.ts`

- [ ] **Step 1: Create useMovies.ts**

```ts
import { useQuery, gql } from '@apollo/client';

const SEARCH_MOVIES = gql`
  query SearchMovies($query: String!, $page: Int) {
    searchMovies(query: $query, page: $page) {
      tmdbId title posterUrl releaseDate voteAverage genres
    }
  }
`;

const TRENDING_MOVIES = gql`
  query TrendingMovies {
    trendingMovies {
      tmdbId title posterUrl releaseDate voteAverage genres
    }
  }
`;

const MOVIE = gql`
  query Movie($tmdbId: Int!) {
    movie(tmdbId: $tmdbId) {
      tmdbId title overview posterUrl backdropUrl releaseDate voteAverage genres runtime
      cast { name character profileUrl }
    }
  }
`;

const DISCOVER_MOVIES = gql`
  query DiscoverMovies($genreIds: [Int!], $minRating: Float, $page: Int) {
    discoverMovies(genreIds: $genreIds, minRating: $minRating, page: $page) {
      tmdbId title posterUrl releaseDate voteAverage genres
    }
  }
`;

const RECOMMENDATIONS = gql`
  query Recommendations($tmdbId: Int!) {
    recommendations(tmdbId: $tmdbId) {
      tmdbId title posterUrl releaseDate voteAverage genres
    }
  }
`;

export function useSearchMovies(query: string, page?: number) {
  return useQuery(SEARCH_MOVIES, {
    variables: { query, page },
    skip: !query,
  });
}

export function useTrendingMovies() {
  return useQuery(TRENDING_MOVIES);
}

export function useMovie(tmdbId: number) {
  return useQuery(MOVIE, { variables: { tmdbId } });
}

export function useDiscoverMovies(genreIds?: number[], minRating?: number, page?: number) {
  return useQuery(DISCOVER_MOVIES, { variables: { genreIds, minRating, page } });
}

export function useRecommendations(tmdbId: number) {
  return useQuery(RECOMMENDATIONS, { variables: { tmdbId } });
}
```

- [ ] **Step 2: Create useWatchlist.ts**

```ts
import { useQuery, useMutation, gql } from '@apollo/client';

const WATCHLIST = gql`
  query Watchlist {
    watchlist {
      id watched addedAt
      movie { tmdbId title posterUrl voteAverage genres }
    }
  }
`;

const ADD_TO_WATCHLIST = gql`
  mutation AddToWatchlist($tmdbId: Int!) {
    addToWatchlist(tmdbId: $tmdbId) { id watched movie { tmdbId title } }
  }
`;

const REMOVE_FROM_WATCHLIST = gql`
  mutation RemoveFromWatchlist($tmdbId: Int!) {
    removeFromWatchlist(tmdbId: $tmdbId)
  }
`;

const MARK_WATCHED = gql`
  mutation MarkWatched($tmdbId: Int!, $watched: Boolean!) {
    markWatched(tmdbId: $tmdbId, watched: $watched) { id watched movie { tmdbId title } }
  }
`;

export function useWatchlist() {
  return useQuery(WATCHLIST);
}

export function useAddToWatchlist() {
  return useMutation(ADD_TO_WATCHLIST, { refetchQueries: ['Watchlist'] });
}

export function useRemoveFromWatchlist() {
  return useMutation(REMOVE_FROM_WATCHLIST, { refetchQueries: ['Watchlist'] });
}

export function useMarkWatched() {
  return useMutation(MARK_WATCHED, { refetchQueries: ['Watchlist'] });
}
```

- [ ] **Step 3: Commit**

```bash
git add client/src/hooks/
git commit -m "feat: add Apollo Client hooks for queries and mutations"
```

---

### Task 14: Create UI Components

**Files:**
- Create: `client/src/components/SearchBar.tsx`
- Create: `client/src/components/MovieCard.tsx`
- Create: `client/src/components/MovieGrid.tsx`
- Create: `client/src/components/MovieDetail.tsx`
- Create: `client/src/components/WatchlistPage.tsx`
- Create: `client/src/components/Recommender.tsx`

- [ ] **Step 1: Create SearchBar.tsx**

```tsx
import { useState } from 'react';

interface Props {
  onSearch: (query: string) => void;
}

export default function SearchBar({ onSearch }: Props) {
  const [value, setValue] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(value);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: '1rem' }}>
      <input
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Search movies..."
        style={{ padding: '0.5rem', width: '300px', marginRight: '0.5rem' }}
      />
      <button type="submit">Search</button>
    </form>
  );
}
```

- [ ] **Step 2: Create MovieCard.tsx**

```tsx
import { useNavigate } from 'react-router-dom';

interface Props {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
}

const placeholderPoster = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%23ddd" width="300" height="450"/><text fill="%23999" x="150" y="225" text-anchor="middle" font-family="sans-serif">No Poster</text></svg>';

export default function MovieCard({ tmdbId, title, posterUrl, voteAverage, releaseDate }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie/${tmdbId}`)}
      style={{
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        width: '200px',
      }}
    >
      <img
        src={posterUrl || placeholderPoster}
        alt={title}
        style={{ width: '100%', height: '300px', objectFit: 'cover' }}
      />
      <div style={{ padding: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{title}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
          <span>{releaseDate?.substring(0, 4)}</span>
          <span>★ {voteAverage?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create MovieGrid.tsx**

```tsx
import MovieCard from './MovieCard';

interface MovieItem {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
}

interface Props {
  movies: MovieItem[];
  title?: string;
}

export default function MovieGrid({ movies, title }: Props) {
  return (
    <div>
      {title && <h2>{title}</h2>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {movies.map(m => (
          <MovieCard key={m.tmdbId} {...m} />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create MovieDetail.tsx**

```tsx
import { useMovie, useRecommendations } from '../hooks/useMovies';
import { useAddToWatchlist, useRemoveFromWatchlist, useWatchlist } from '../hooks/useWatchlist';
import MovieGrid from './MovieGrid';
import { useParams } from 'react-router-dom';

export default function MovieDetail() {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const { loading, error, data } = useMovie(Number(tmdbId));
  const { data: watchlistData } = useWatchlist();
  const { data: recsData } = useRecommendations(Number(tmdbId));
  const [addToWatchlist] = useAddToWatchlist();
  const [removeFromWatchlist] = useRemoveFromWatchlist();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!data?.movie) return <p>Movie not found</p>;

  const movie = data.movie;
  const inWatchlist = watchlistData?.watchlist?.some((e: any) => e.movie.tmdbId === movie.tmdbId);

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem' }}>
        {movie.posterUrl && (
          <img src={movie.posterUrl} alt={movie.title} style={{ width: '300px', borderRadius: '8px' }} />
        )}
        <div>
          <h1>
            {movie.title}
            {movie.releaseDate && <span style={{ fontSize: '1rem', color: '#666', marginLeft: '0.5rem' }}>({movie.releaseDate.substring(0, 4)})</span>}
          </h1>
          <p>★ {movie.voteAverage?.toFixed(1)}</p>
          {movie.runtime > 0 && <p>{movie.runtime} min</p>}
          {movie.genres && <p>{movie.genres.join(', ')}</p>}
          <p>{movie.overview}</p>

          {inWatchlist ? (
            <button onClick={() => removeFromWatchlist({ variables: { tmdbId: movie.tmdbId } })}>
              Remove from Watchlist
            </button>
          ) : (
            <button onClick={() => addToWatchlist({ variables: { tmdbId: movie.tmdbId } })}>
              Add to Watchlist
            </button>
          )}
        </div>
      </div>

      {movie.cast && movie.cast.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h2>Cast</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            {movie.cast.map((c: any) => (
              <div key={c.name} style={{ width: '120px', textAlign: 'center' }}>
                {c.profileUrl && (
                  <img src={c.profileUrl} alt={c.name} style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <p style={{ fontSize: '0.8rem', margin: '0.3rem 0' }}><strong>{c.name}</strong></p>
                <p style={{ fontSize: '0.7rem', color: '#666', margin: 0 }}>{c.character}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {recsData?.recommendations && recsData.recommendations.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <MovieGrid movies={recsData.recommendations} title="Recommendations" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Create WatchlistPage.tsx**

```tsx
import { useWatchlist, useRemoveFromWatchlist, useMarkWatched } from '../hooks/useWatchlist';

export default function WatchlistPage() {
  const { loading, error, data } = useWatchlist();
  const [removeFromWatchlist] = useRemoveFromWatchlist();
  const [markWatched] = useMarkWatched();

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const entries = data?.watchlist || [];

  if (entries.length === 0) return <p>Your watchlist is empty.</p>;

  return (
    <div>
      <h1>Watchlist</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {entries.map((entry: any) => (
          <div
            key={entry.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              padding: '0.5rem',
              border: '1px solid #ddd',
              borderRadius: '8px',
            }}
          >
            {entry.movie.posterUrl && (
              <img src={entry.movie.posterUrl} alt={entry.movie.title} style={{ width: '60px', borderRadius: '4px' }} />
            )}
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: 0 }}>{entry.movie.title}</h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#666' }}>
                {entry.movie.genres?.join(', ')} — ★ {entry.movie.voteAverage?.toFixed(1)}
              </p>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <input
                type="checkbox"
                checked={entry.watched}
                onChange={() => markWatched({ variables: { tmdbId: entry.movie.tmdbId, watched: !entry.watched } })}
              />
              Watched
            </label>
            <button onClick={() => removeFromWatchlist({ variables: { tmdbId: entry.movie.tmdbId } })}>
              Remove
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Create Recommender.tsx**

```tsx
import { useState } from 'react';
import { useDiscoverMovies } from '../hooks/useMovies';
import MovieGrid from './MovieGrid';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export default function Recommender() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState(false);

  const { loading, error, data } = useDiscoverMovies(
    selectedGenres.length > 0 ? selectedGenres : undefined,
    minRating > 0 ? minRating : undefined,
    1
  );

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  return (
    <div>
      <h1>Discover Movies</h1>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Genres</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {GENRES.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              style={{
                padding: '0.3rem 0.8rem',
                background: selectedGenres.includes(g.id) ? '#007bff' : '#eee',
                color: selectedGenres.includes(g.id) ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Minimum Rating: {minRating}</h3>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minRating}
          onChange={e => setMinRating(parseFloat(e.target.value))}
        />
      </div>

      <button onClick={() => setSearch(true)}>Discover</button>

      {search && loading && <p>Loading...</p>}
      {search && error && <p>Error: {error.message}</p>}
      {search && data?.discoverMovies && (
        <div style={{ marginTop: '1rem' }}>
          <MovieGrid movies={data.discoverMovies} title="Results" />
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add client/src/components/
git commit -m "feat: add UI components"
```

---

### Task 15: Create Page Components

**Files:**
- Create: `client/src/pages/HomePage.tsx`
- Create: `client/src/pages/MoviePage.tsx`
- Create: `client/src/pages/WatchlistPage.tsx`
- Create: `client/src/pages/DiscoverPage.tsx`

- [ ] **Step 1: Create HomePage.tsx**

```tsx
import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { useSearchMovies, useTrendingMovies } from '../hooks/useMovies';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const { data: searchData } = useSearchMovies(query);
  const { loading, data: trendingData } = useTrendingMovies();

  return (
    <div>
      <SearchBar onSearch={setQuery} />

      {query ? (
        searchData?.searchMovies ? (
          <MovieGrid movies={searchData.searchMovies} title="Search Results" />
        ) : null
      ) : (
        <>
          {loading && <p>Loading trending...</p>}
          {trendingData?.trendingMovies && (
            <MovieGrid movies={trendingData.trendingMovies} title="Trending This Week" />
          )}
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MoviePage.tsx**

```tsx
import MovieDetail from '../components/MovieDetail';

export default function MoviePage() {
  return <MovieDetail />;
}
```

- [ ] **Step 3: Create WatchlistPage.tsx**

```tsx
import WatchlistView from '../components/WatchlistPage';

export default function WatchlistPage() {
  return <WatchlistView />;
}
```

- [ ] **Step 4: Create DiscoverPage.tsx**

```tsx
import Recommender from '../components/Recommender';

export default function DiscoverPage() {
  return <Recommender />;
}
```

- [ ] **Step 5: Commit**

```bash
git add client/src/pages/
git commit -m "feat: add page components"
```

---

### Task 16: Install Dependencies and Verify Build

- [ ] **Step 1: Install client dependencies**

Run: `cd client && npm install`

- [ ] **Step 2: Verify frontend builds**

Run: `cd client && npx tsc --noEmit`
Expected: No type errors

- [ ] **Step 3: Verify backend builds**

Run: `cd server && ./mvnw compile -q`
Expected: BUILD SUCCESS

- [ ] **Step 4: Commit any lockfile changes**

```bash
git add client/package-lock.json
git commit -m "chore: add lockfile"
```
