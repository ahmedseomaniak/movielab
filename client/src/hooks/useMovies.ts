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
