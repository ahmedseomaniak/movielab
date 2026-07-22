# Monitoring Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add custom business metrics (GraphQL timing, TMDB error rate, watchlist size), configure alerting rules, and build a comprehensive Grafana dashboard.

**Architecture:** Custom Micrometer metrics via `MeterRegistry` in service layer, Prometheus AlertManager rules file, Grafana dashboard JSON provisioning.

**Tech Stack:** Micrometer, Prometheus, Grafana, Docker Compose

## Global Constraints

- Backend runs locally on port 8080
- Monitoring stack runs via `docker compose -f monitoring/docker-compose.yml up -d`
- All metrics exported via `/actuator/prometheus`
- Grafana dashboards auto-provisioned via `/monitoring/grafana/dashboards/`

---

### Task 1: Custom Metrics — GraphQL Query Timing

**Files:**
- Modify: `server/src/main/java/com/movielab/config/WebClientConfig.java`
- Create: `server/src/main/java/com/movielab/config/MetricsConfig.java`
- Modify: `server/src/main/java/com/movielab/graphql/MovieGraphQLController.java`
- Modify: `server/src/main/java/com/movielab/graphql/WatchlistGraphQLController.java`
- Test: verify via `curl http://localhost:8080/actuator/prometheus | grep movielab`

**Interfaces:**
- Consumes: `io.micrometer.core.instrument.MeterRegistry` (Spring Boot auto-configures this)
- Produces: Micrometer `Timer` beans with tags `query` and `source`

- [ ] **Step 1: Create `MetricsConfig.java` with a Timer builder bean**

Create `server/src/main/java/com/movielab/config/MetricsConfig.java`:

```java
package com.movielab.config;

import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MetricsConfig {

    @Bean
    public MeterRegistry meterRegistry(MeterRegistry registry) {
        return registry;
    }
}
```

- [ ] **Step 2: Add GraphQL query timing to `MovieGraphQLController.java`**

Inject `MeterRegistry` and wrap each resolver method with a `Timer.Sample`:

```java
package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.service.TmdbService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;
import java.util.concurrent.TimeUnit;

@Controller
public class MovieGraphQLController {

    private final TmdbService tmdbService;
    private final MeterRegistry meterRegistry;

    public MovieGraphQLController(TmdbService tmdbService, MeterRegistry meterRegistry) {
        this.tmdbService = tmdbService;
        this.meterRegistry = meterRegistry;
    }

    @QueryMapping
    public List<Movie> searchMovies(@Argument String query, @Argument Integer page) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.searchMovies(query, page != null ? page : 1);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "searchMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public Movie movie(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getMovie(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "movie")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public List<Movie> trendingMovies() {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getTrendingMovies();
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "trendingMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public List<Movie> discoverMovies(@Argument List<Integer> genreIds,
                                       @Argument Double minRating,
                                       @Argument Integer page) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.discoverMovies(genreIds, minRating, page != null ? page : 1);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "discoverMovies")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }

    @QueryMapping
    public List<Movie> recommendations(@Argument int tmdbId) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return tmdbService.getRecommendations(tmdbId);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "recommendations")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }
}
```

- [ ] **Step 3: Add GraphQL timing to `WatchlistGraphQLController.java`**

```java
package com.movielab.graphql;

import com.movielab.model.Movie;
import com.movielab.model.WatchlistEntry;
import com.movielab.service.WatchlistService;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.graphql.data.method.annotation.SchemaMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

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

    @SchemaMapping(typeName = "WatchlistEntry", field = "movie")
    public Movie movie(WatchlistEntry entry) {
        Timer.Sample sample = Timer.start(meterRegistry);
        try {
            return watchlistService.getMovieForEntry(entry);
        } finally {
            sample.stop(Timer.builder("movielab.graphql.query")
                    .tag("query", "watchlist.movie")
                    .tag("source", "tmdb")
                    .register(meterRegistry));
        }
    }
}
```

- [ ] **Step 4: Build and verify metrics endpoint**

```bash
cd server
./mvnw clean package -DskipTests
java -jar target/movielab-1.0.0.jar &
sleep 8
curl -s http://localhost:8080/actuator/prometheus | grep movielab
```

Expected: timer metrics like `movielab_graphql_query_seconds_sum` appear.

- [ ] **Step 5: Commit**

```bash
git add server/src/main/java/com/movielab/config/MetricsConfig.java server/src/main/java/com/movielab/graphql/MovieGraphQLController.java server/src/main/java/com/movielab/graphql/WatchlistGraphQLController.java
git commit -m "feat(monitoring): add custom GraphQL query timing metrics"
```

---

### Task 2: Custom Metrics — TMDB Error Rate & Watchlist Size

**Files:**
- Modify: `server/src/main/java/com/movielab/service/TmdbService.java`
- Modify: `server/src/main/java/com/movielab/service/WatchlistService.java`

**Interfaces:**
- Consumes: `MeterRegistry`
- Produces: Counter `movielab.tmdb.errors`, Gauge `movielab.watchlist.size`

- [ ] **Step 1: Add TMDB error counter to `TmdbService.java`**

Inject `MeterRegistry`, wrap each API call with try-catch to count errors:

```java
package com.movielab.service;

import com.movielab.model.CastMember;
import com.movielab.model.Movie;
import com.movielab.model.tmdb.*;
import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TmdbService {

    private final RestClient restClient;
    private final String imageBaseUrl;
    private final Counter tmdbErrorCounter;

    public TmdbService(RestClient tmdbRestClient,
                       @Value("${tmdb.image-base-url}") String imageBaseUrl,
                       MeterRegistry meterRegistry) {
        this.restClient = tmdbRestClient;
        this.imageBaseUrl = imageBaseUrl;
        this.tmdbErrorCounter = Counter.builder("movielab.tmdb.errors")
                .description("TMDB API call errors")
                .register(meterRegistry);
    }

    public List<Movie> searchMovies(String query, int page) {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/search/movie")
                            .queryParam("query", query)
                            .queryParam("page", page)
                            .build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public Movie getMovie(int tmdbId) {
        try {
            TmdbMovieResponse movieResponse = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId).build())
                    .retrieve()
                    .body(TmdbMovieResponse.class);

            TmdbCreditsResponse creditsResponse = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/credits").build())
                    .retrieve()
                    .body(TmdbCreditsResponse.class);

            return mapToMovie(movieResponse, creditsResponse);
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            throw e;
        }
    }

    public List<Movie> getTrendingMovies() {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/trending/movie/week").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public List<Movie> discoverMovies(List<Integer> genreIds, Double minRating, int page) {
        try {
            TmdbDiscoverResponse response = restClient.get()
                    .uri(uri -> {
                        var u = uri.path("/discover/movie")
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
                    .body(TmdbDiscoverResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    public List<Movie> getRecommendations(int tmdbId) {
        try {
            TmdbSearchResponse response = restClient.get()
                    .uri(uri -> uri.path("/movie/" + tmdbId + "/recommendations").build())
                    .retrieve()
                    .body(TmdbSearchResponse.class);
            return mapToMovies(response != null ? response.getResults() : Collections.emptyList());
        } catch (Exception e) {
            tmdbErrorCounter.increment();
            return Collections.emptyList();
        }
    }

    // mapToMovie, mapToMovieSimple, mapToMovies remain unchanged
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

- [ ] **Step 2: Add watchlist size gauge to `WatchlistService.java`**

```java
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
```

- [ ] **Step 3: Build and verify custom metrics**

```bash
cd server
./mvnw clean package -DskipTests -q
java -jar target/movielab-1.0.0.jar &
sleep 8
curl -s http://localhost:8080/actuator/prometheus | grep -E "movielab"
```

Expected: `movielab_tmdb_errors_total` and `movielab_watchlist_size` appear.

- [ ] **Step 4: Commit**

```bash
git add server/src/main/java/com/movielab/service/TmdbService.java server/src/main/java/com/movielab/service/WatchlistService.java
git commit -m "feat(monitoring): add TMDB error counter and watchlist size gauge"
```

---

### Task 3: Prometheus Alerting Rules

**Files:**
- Create: `monitoring/prometheus/alerts.yml`
- Modify: `monitoring/prometheus/prometheus.yml`

- [ ] **Step 1: Create alerting rules file `monitoring/prometheus/alerts.yml`**

```yaml
groups:
  - name: movielab
    rules:
      - alert: HighTmdbErrorRate
        expr: rate(movielab_tmdb_errors_total[5m]) > 0.1
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "TMDB API error rate is high"
          description: "TMDB API errors rate is {{ $value }} errors/sec over 5m"

      - alert: WatchlistSizeAnomaly
        expr: movielab_watchlist_size > 100
        for: 5m
        labels:
          severity: info
        annotations:
          summary: "Watchlist has grown large"
          description: "Watchlist contains {{ $value }} entries"

      - alert: HighJvmMemoryUsage
        expr: jvm_memory_used_bytes{area="heap"} / jvm_memory_max_bytes{area="heap"} > 0.85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "JVM heap usage above 85%"
          description: "Heap usage is {{ $value | humanizePercentage }}"

      - alert: BackendDown
        expr: up{job="movielab-api"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "Backend is down"
          description: "movielab-api is unreachable from Prometheus"
```

- [ ] **Step 2: Update `monitoring/prometheus/prometheus.yml` to load alerts and remove Render job**

```yaml
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - 'alerts.yml'

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['node-exporter:9100']

  - job_name: 'movielab-api'
    metrics_path: '/actuator/prometheus'
    static_configs:
      - targets: ['host.docker.internal:8080']
        labels:
          application: 'movielab-api'
```

- [ ] **Step 3: Commit**

```bash
git add monitoring/prometheus/alerts.yml monitoring/prometheus/prometheus.yml
git commit -m "feat(monitoring): add alerting rules and clean up prometheus config"
```

---

### Task 4: Enhanced Grafana Dashboard

**Files:**
- Modify: `monitoring/grafana/dashboards/movielab-overview.json`

- [ ] **Step 1: Replace the dashboard JSON with comprehensive panels**

Write to `monitoring/grafana/dashboards/movielab-overview.json`:

```json
{
  "title": "MovieLab - Application Overview",
  "uid": "movielab-overview",
  "version": 2,
  "timezone": "browser",
  "tags": ["movielab", "spring"],
  "schemaVersion": 36,
  "panels": [
    {
      "title": "GraphQL Query Duration (P95)",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "histogram_quantile(0.95, sum(rate(movielab_graphql_query_seconds_bucket[5m])) by (le, query))",
        "legendFormat": "{{query}}"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 0 }
    },
    {
      "title": "GraphQL Query Rate",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "rate(movielab_graphql_query_seconds_count[1m])",
        "legendFormat": "{{query}}"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 0 }
    },
    {
      "title": "TMDB API Errors",
      "type": "stat",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "rate(movielab_tmdb_errors_total[5m])",
        "legendFormat": "Errors/sec"
      }],
      "gridPos": { "h": 6, "w": 6, "x": 0, "y": 8 }
    },
    {
      "title": "Watchlist Size",
      "type": "stat",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "movielab_watchlist_size",
        "legendFormat": "Entries"
      }],
      "gridPos": { "h": 6, "w": 6, "x": 6, "y": 8 }
    },
    {
      "title": "JVM Heap Memory",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "sum(jvm_memory_used_bytes{area=\"heap\"}) by (instance)",
        "legendFormat": "Used"
      }, {
        "expr": "sum(jvm_memory_max_bytes{area=\"heap\"}) by (instance)",
        "legendFormat": "Max"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 14 }
    },
    {
      "title": "HTTP Request Rate",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "rate(http_server_requests_seconds_count[1m])",
        "legendFormat": "{{uri}} ({{method}})"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 14 }
    },
    {
      "title": "HTTP Response Latency (P95)",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "histogram_quantile(0.95, sum(rate(http_server_requests_seconds_bucket[5m])) by (le, uri, method))",
        "legendFormat": "{{uri}} ({{method}})"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 0, "y": 22 }
    },
    {
      "title": "CPU Usage",
      "type": "graph",
      "datasource": { "type": "prometheus", "uid": "Prometheus" },
      "targets": [{
        "expr": "system_cpu_usage",
        "legendFormat": "System"
      }, {
        "expr": "process_cpu_usage",
        "legendFormat": "Process"
      }],
      "gridPos": { "h": 8, "w": 12, "x": 12, "y": 22 }
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add monitoring/grafana/dashboards/movielab-overview.json
git commit -m "feat(monitoring): enhance Grafana dashboard with GraphQL, TMDB, and watchlist panels"
```

---

### Task 5: Verify Full Stack

- [ ] **Step 1: Start monitoring stack**

```bash
docker compose -f monitoring/docker-compose.yml up -d
```

Expected: Prometheus on http://localhost:9090, Grafana on http://localhost:3000 (admin/admin)

- [ ] **Step 2: Start backend and verify metrics**

```bash
cd server
java -jar target/movielab-1.0.0.jar &
sleep 8
curl -s http://localhost:8080/actuator/prometheus | grep movielab
```

Expected: All `movielab_*` metrics visible.

- [ ] **Step 3: Verify Grafana dashboard loads**

Open http://localhost:3000 → login admin/admin → "MovieLab - Application Overview" dashboard should show all panels with data.

- [ ] **Step 4: Commit final verification (no code changes)**

No commit needed for verification.
