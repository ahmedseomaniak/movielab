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
