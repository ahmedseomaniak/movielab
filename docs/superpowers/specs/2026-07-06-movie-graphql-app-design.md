# Movie GraphQL App — Design Spec

## Stack
- **Backend**: Spring Boot 3 + spring-graphql + spring-boot-starter-webflux (WebClient for TMDB) + H2 + JPA
- **Frontend**: React + TypeScript + Apollo Client
- **External**: TMDB API v3 (40-50 req/s, free tier)

## Architecture

```
Browser (React + Apollo Client)
      ↕ GraphQL
Spring Boot (spring-graphql, JPA, WebClient)
      ↕ REST
TMDB API (external)
```

No BFF layer. Spring Boot is the sole backend — fetches TMDB data, manages watchlists in H2. Apollo Client talks directly to Spring's GraphQL endpoint.

---

## GraphQL Schema

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
  searchMovies(query: String!, page: Int = 1): [Movie!]!
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

---

## Backend (Spring Boot)

```
src/main/java/com/movielab/
  config/
    WebClientConfig.java         — TMDB WebClient bean with API key
    GraphQLConfig.java           — GraphQL schema registration
  model/
    Movie.java                   — GraphQL DTO
    CastMember.java              — GraphQL DTO
    WatchlistEntry.java          — JPA entity (id, tmdbId, watched, addedAt)
    tmdb/                        — TMDB API response DTOs
      TmdbMovieResponse.java
      TmdbCastResponse.java
      TmdbCreditsResponse.java
  repository/
    WatchlistRepository.java     — JPA repository
  service/
    TmdbService.java             — WebClient calls to TMDB (search, details, credits, discover, trending, recommendations)
    WatchlistService.java        — CRUD for watchlist, enriches entries with TMDB movie data
    RecommenderService.java      — Orchestrates TMDB discover + recommendations
  graphql/
    MovieGraphQLController.java  — @QueryMapping for searchMovies, movie, trendingMovies, discoverMovies, recommendations
    WatchlistGraphQLController.java — @QueryMapping watchlist, @MutationMapping addToWatchlist, removeFromWatchlist, markWatched
```

### Key Backend Decisions

- **Non-blocking TMDB calls**: `WebClient` for async HTTP. Spring GraphQL with `WebMvc` (simpler) is fine — TMDB calls are wrapped in `Mono`/`Flux` and blocked at the resolver level
- **TMDB image URLs**: Construct from TMDB's base URL pattern (`https://image.tmdb.org/t/p/w500/...`). Image API key not needed for serving URLs
- **H2**: File-based mode (`jdbc:h2:file:./data/movielab`). Starts empty, schema auto-created by JPA
- **Caching**: TMDB data is not cached server-side (good enough rate limits). Apollo Client cache on frontend handles dedup
- **Watchlist enrichment**: `WatchlistEntry` stores only `tmdbId` + metadata. On read, enriches with current TMDB data (title, poster, etc.)

### application.properties

```properties
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

---

## Frontend (React + Apollo Client)

```
src/
  components/
    SearchBar.tsx          — Text input, fires searchMovies query
    MovieGrid.tsx          — Grid of MovieCard components
    MovieCard.tsx          — Poster + title + rating, click navigates to detail
    MovieDetail.tsx        — Full movie info + cast list + add-to-watchlist button + recommendations
    WatchlistPage.tsx      — List of saved movies with watched toggle
    Recommender.tsx        — Genre picker + min rating slider, calls discoverMovies
  graphql/
    queries.graphql        — searchMovies, movie, trendingMovies, discoverMovies, recommendations, watchlist
    mutations.graphql      — addToWatchlist, removeFromWatchlist, markWatched
  hooks/
    useMovies.ts           — Apollo Client query wrappers
    useWatchlist.ts        — Apollo Client query + mutation wrappers
  pages/
    HomePage.tsx           — Trending movies + search bar
    MoviePage.tsx          — MovieDetail component
    WatchlistPage.tsx      — WatchlistPage component
    DiscoverPage.tsx       — Recommender component
  App.tsx                  — React Router setup
  apolloClient.ts          — Apollo Client config (uri: http://localhost:8080/graphql)
```

### Pages

| Page | Route | Content |
|------|-------|---------|
| Home | `/` | Search bar + trending movies grid |
| Movie | `/movie/:tmdbId` | Full detail + cast + recommendations + add to watchlist |
| Watchlist | `/watchlist` | Saved movies with watched/unwatched toggle |
| Discover | `/discover` | Genre selector + rating filter + results grid |

---

## Data Flow Examples

### Search
1. User types in SearchBar → `useSearchMovies(query)` fires
2. Apollo Client checks cache, falls through to Spring
3. `MovieGraphQLController.searchMovies()` → `TmdbService.searchMovies()`
4. TMDB `/search/movie?query=...` → maps to `Movie` DTOs → returns
5. Apollo Client caches result per query+variables

### Add to Watchlist
1. User clicks "Add to Watchlist" on MovieDetail
2. `useAddToWatchlist` fires mutation `addToWatchlist(tmdbId: 550)`
3. `WatchlistGraphQLController.addToWatchlist()` → `WatchlistService.addToWatchlist()`
4. Creates `WatchlistEntry` in H2, returns enriched with TMDB movie data
5. Apollo Client updates cache → watchlist query auto-refreshes

---

## Non-Goals (Out of Scope)
- User authentication (single user)
- User reviews/ratings (use TMDB's)
- Server-side movie cache
- Infinite scroll (pagination through `page` param)
- Mobile native app

---

## Future Ideas
- Multi-user support with auth
- TMDB rating sync
- Social features (shared watchlists)
- Movie stats/analytics
