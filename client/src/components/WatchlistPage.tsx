import { useWatchlist, useRemoveFromWatchlist, useMarkWatched } from '../hooks/useWatchlist';
import { useNavigate } from 'react-router-dom';

export default function WatchlistView() {
  const { loading, error, data } = useWatchlist();
  const [removeFromWatchlist, { loading: removing }] = useRemoveFromWatchlist();
  const [markWatched, { loading: marking }] = useMarkWatched();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="wl">
        <h1 className="wl__title">Watchlist</h1>
        <div className="wl__empty">
          <p>Loading your collection...</p>
        </div>
        <style>{`
          .wl__empty {
            text-align: center; padding: 4rem 2rem;
            color: var(--text-muted);
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="wl">
        <h1 className="wl__title">Watchlist</h1>
        <div className="wl__empty">
          <p>Failed to load watchlist</p>
        </div>
      </div>
    );
  }

  const entries = data?.watchlist || [];
  const unwatched = entries.filter((e: any) => !e.watched);
  const watched = entries.filter((e: any) => e.watched);

  if (entries.length === 0) {
    return (
      <div className="wl">
        <h1 className="wl__title">Watchlist</h1>
        <div className="wl__empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48" className="wl__empty-icon">
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
          </svg>
          <p className="wl__empty-text">Your watchlist is empty</p>
          <p className="wl__empty-hint">Search for films and add them to start building your collection</p>
          <button className="wl__browse-btn" onClick={() => navigate('/')}>Browse films</button>
        </div>
      </div>
    );
  }

  return (
    <div className="wl">
      <div className="wl__header">
        <h1 className="wl__title">Watchlist</h1>
        <span className="wl__count">{entries.length} film{entries.length !== 1 ? 's' : ''}</span>
      </div>

      {unwatched.length > 0 && (
        <section className="wl__section">
          <h2 className="wl__section-title">To Watch</h2>
          <div className="wl__list">
            {unwatched.map((entry: any) => (
              <div key={entry.id} className="wl__item">
                <div className="wl__item-poster" onClick={() => navigate(`/movie/${entry.movie.tmdbId}`)}>
                  {entry.movie.posterUrl ? (
                    <img src={entry.movie.posterUrl} alt={entry.movie.title} className="wl__item-img" />
                  ) : (
                    <div className="wl__item-img wl__item-img--placeholder" />
                  )}
                </div>
                <div className="wl__item-info" onClick={() => navigate(`/movie/${entry.movie.tmdbId}`)}>
                  <h3 className="wl__item-title">{entry.movie.title}</h3>
                  <div className="wl__item-meta">
                    {entry.movie.genres && entry.movie.genres.length > 0 && (
                      <span className="wl__item-genres">{entry.movie.genres.join(', ')}</span>
                    )}
                    {entry.movie.voteAverage != null && entry.movie.voteAverage > 0 && (
                      <span className="wl__item-rating">★ {entry.movie.voteAverage.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <div className="wl__item-actions">
                  <button
                    className="wl__action wl__action--watched"
                    onClick={() => markWatched({ variables: { tmdbId: entry.movie.tmdbId, watched: true } })}
                    disabled={marking}
                    title="Mark as watched"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </button>
                  <button
                    className="wl__action wl__action--remove"
                    onClick={() => removeFromWatchlist({ variables: { tmdbId: entry.movie.tmdbId } })}
                    disabled={removing}
                    title="Remove from watchlist"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {watched.length > 0 && (
        <section className="wl__section">
          <h2 className="wl__section-title">Watched <span className="wl__section-count">{watched.length}</span></h2>
          <div className="wl__list">
            {watched.map((entry: any) => (
              <div key={entry.id} className="wl__item wl__item--watched">
                <div className="wl__item-poster" onClick={() => navigate(`/movie/${entry.movie.tmdbId}`)}>
                  {entry.movie.posterUrl ? (
                    <img src={entry.movie.posterUrl} alt={entry.movie.title} className="wl__item-img" />
                  ) : (
                    <div className="wl__item-img wl__item-img--placeholder" />
                  )}
                </div>
                <div className="wl__item-info" onClick={() => navigate(`/movie/${entry.movie.tmdbId}`)}>
                  <h3 className="wl__item-title">{entry.movie.title}</h3>
                  <div className="wl__item-meta">
                    {entry.movie.genres && entry.movie.genres.length > 0 && (
                      <span className="wl__item-genres">{entry.movie.genres.join(', ')}</span>
                    )}
                  </div>
                </div>
                <div className="wl__item-actions">
                  <button
                    className="wl__action wl__action--undo"
                    onClick={() => markWatched({ variables: { tmdbId: entry.movie.tmdbId, watched: false } })}
                    disabled={marking}
                    title="Mark as unwatched"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                  <button
                    className="wl__action wl__action--remove"
                    onClick={() => removeFromWatchlist({ variables: { tmdbId: entry.movie.tmdbId } })}
                    disabled={removing}
                    title="Remove from watchlist"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <style>{`
        .wl { animation: fadeUp 0.6s ease-out; }
        .wl__header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .wl__title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--text);
        }
        .wl__count {
          font-size: 0.9rem;
          color: var(--text-dim);
        }
        .wl__empty {
          text-align: center;
          padding: 5rem 2rem;
          color: var(--text-muted);
        }
        .wl__empty-icon {
          color: var(--text-dim);
          margin-bottom: 1.5rem;
        }
        .wl__empty-text {
          font-size: 1.2rem;
          color: var(--text);
          margin-bottom: 0.5rem;
          font-family: var(--font-display);
        }
        .wl__empty-hint {
          font-size: 0.9rem;
          margin-bottom: 2rem;
        }
        .wl__browse-btn {
          background: var(--accent);
          color: var(--bg);
          border: none;
          padding: 0.75rem 2rem;
          border-radius: var(--radius-pill);
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition);
        }
        .wl__browse-btn:hover { background: var(--accent-dim); }
        .wl__section {
          margin-bottom: 2.5rem;
        }
        .wl__section-title {
          font-family: var(--font-display);
          font-size: 1.35rem;
          font-weight: 400;
          color: var(--text);
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .wl__section-count {
          font-size: 0.8rem;
          color: var(--text-dim);
          font-family: var(--font-body);
        }
        .wl__list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .wl__item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: border-color var(--transition);
          cursor: default;
        }
        .wl__item:hover {
          border-color: var(--border-light);
        }
        .wl__item--watched {
          opacity: 0.6;
        }
        .wl__item--watched:hover {
          opacity: 0.8;
        }
        .wl__item-poster {
          width: 52px;
          flex-shrink: 0;
          border-radius: 4px;
          overflow: hidden;
          cursor: pointer;
        }
        .wl__item-img {
          width: 100%;
          aspect-ratio: 2/3;
          object-fit: cover;
          display: block;
        }
        .wl__item-img--placeholder {
          background: var(--bg-elevated);
        }
        .wl__item-info {
          flex: 1;
          min-width: 0;
          cursor: pointer;
        }
        .wl__item-title {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wl__item-meta {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 0.15rem;
          font-size: 0.8rem;
          color: var(--text-dim);
        }
        .wl__item-genres {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .wl__item-rating {
          color: var(--accent);
          flex-shrink: 0;
        }
        .wl__item-actions {
          display: flex;
          gap: 0.5rem;
          flex-shrink: 0;
        }
        .wl__action {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border: 1px solid var(--border);
          border-radius: 50%;
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition);
        }
        .wl__action:disabled { opacity: 0.4; cursor: not-allowed; }
        .wl__action--watched:hover {
          border-color: var(--accent-dim);
          color: var(--accent);
          background: rgba(212, 168, 67, 0.1);
        }
        .wl__action--undo:hover {
          border-color: var(--accent-dim);
          color: var(--accent);
          background: rgba(212, 168, 67, 0.1);
        }
        .wl__action--remove:hover {
          border-color: var(--crimson-dim);
          color: var(--crimson);
          background: rgba(192, 57, 43, 0.1);
        }
        @media (max-width: 640px) {
          .wl__title { font-size: 1.8rem; }
          .wl__item { padding: 0.625rem 0.75rem; gap: 0.75rem; }
          .wl__item-poster { width: 44px; }
          .wl__item-title { font-size: 0.85rem; }
        }
      `}</style>
    </div>
  );
}
