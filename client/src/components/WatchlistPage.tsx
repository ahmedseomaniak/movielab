import { useWatchlist, useRemoveFromWatchlist, useMarkWatched } from '../hooks/useWatchlist';

export default function WatchlistView() {
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
