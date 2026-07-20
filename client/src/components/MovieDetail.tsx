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
