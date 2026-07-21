import { useMovie, useRecommendations } from '../hooks/useMovies';
import { useAddToWatchlist, useRemoveFromWatchlist, useMarkWatched, useWatchlist } from '../hooks/useWatchlist';
import MovieGrid from './MovieGrid';
import { useParams, useNavigate } from 'react-router-dom';

export default function MovieDetail() {
  const { tmdbId } = useParams<{ tmdbId: string }>();
  const navigate = useNavigate();
  const { loading, error, data } = useMovie(Number(tmdbId));
  const { data: watchlistData } = useWatchlist();
  const { data: recsData } = useRecommendations(Number(tmdbId));
  const [addToWatchlist, { loading: adding }] = useAddToWatchlist();
  const [removeFromWatchlist, { loading: removing }] = useRemoveFromWatchlist();
  const [markWatched, { loading: marking }] = useMarkWatched();

  if (loading) {
    return (
      <div className="detail-loading">
        <div className="detail-loading__backdrop" />
        <div className="detail-loading__content">
          <div className="detail-loading__poster" />
          <div className="detail-loading__text">
            <div className="detail-loading__line" style={{ width: '60%', height: '2.5rem' }} />
            <div className="detail-loading__line" style={{ width: '30%' }} />
            <div className="detail-loading__line" style={{ width: '100%' }} />
            <div className="detail-loading__line" style={{ width: '80%' }} />
          </div>
        </div>
        <style>{`
          .detail-loading { padding: 1rem 0; }
          .detail-loading__backdrop {
            height: 400px;
            border-radius: var(--radius);
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            margin-bottom: -160px;
          }
          .detail-loading__content {
            display: flex; gap: 2rem; align-items: flex-end;
            padding: 0 2rem;
          }
          .detail-loading__poster {
            width: 220px; aspect-ratio: 2/3;
            border-radius: var(--radius);
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
            flex-shrink: 0;
          }
          .detail-loading__text {
            flex: 1; display: flex; flex-direction: column; gap: 0.75rem;
            padding-bottom: 1rem;
          }
          .detail-loading__line {
            height: 1rem; border-radius: 4px;
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="detail-error">
        <p>Failed to load film details</p>
        <button className="detail-error__btn" onClick={() => navigate(-1)}>Go back</button>
        <style>{`
          .detail-error {
            text-align: center; padding: 5rem 2rem;
            color: var(--text-muted);
          }
          .detail-error p { font-size: 1.1rem; margin-bottom: 1.5rem; }
          .detail-error__btn {
            background: var(--accent); color: var(--bg);
            border: none; padding: 0.75rem 2rem;
            border-radius: var(--radius-pill);
            font-family: var(--font-body); font-size: 0.9rem;
            cursor: pointer; transition: background var(--transition);
          }
          .detail-error__btn:hover { background: var(--accent-dim); }
        `}</style>
      </div>
    );
  }

  if (!data?.movie) return null;

  const movie = data.movie;
  const entry = watchlistData?.watchlist?.find((e: { movie: { tmdbId: number } }) => e.movie.tmdbId === movie.tmdbId);
  const inWatchlist = !!entry;
  const isWatched = entry?.watched;

  const runtimeDisplay = movie.runtime > 0
    ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m`
    : null;

  return (
    <div className="movie-detail">
      <div className="hero">
        {movie.backdropUrl ? (
          <img src={movie.backdropUrl} alt="" className="hero__bg" />
        ) : (
          <div className="hero__bg hero__bg--fallback" />
        )}
        <div className="hero__gradient" />
        <div className="hero__content">
          <div className="hero__poster-wrapper">
            {movie.posterUrl ? (
              <img src={movie.posterUrl} alt={movie.title} className="hero__poster" />
            ) : (
              <div className="hero__poster hero__poster--placeholder" />
            )}
          </div>
          <div className="hero__info">
            <h1 className="hero__title">{movie.title}</h1>
            <div className="hero__meta">
              {movie.releaseDate && <span className="hero__year">{movie.releaseDate.substring(0, 4)}</span>}
              {runtimeDisplay && <span className="hero__runtime">{runtimeDisplay}</span>}
              {movie.voteAverage != null && movie.voteAverage > 0 && (
                <span className="hero__rating">
                  <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                  {movie.voteAverage.toFixed(1)}
                </span>
              )}
            </div>
            {movie.genres && movie.genres.length > 0 && (
              <div className="hero__genres">
                {movie.genres.map((g: string) => (
                  <span key={g} className="hero__genre">{g}</span>
                ))}
              </div>
            )}
            <div className="hero__actions">
              {inWatchlist ? (
                <>
                  <button
                    className={`hero__btn hero__btn--watched${isWatched ? ' is-watched' : ''}`}
                    onClick={() => markWatched({ variables: { tmdbId: movie.tmdbId, watched: !isWatched } })}
                    disabled={marking}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      {isWatched ? (
                        <polyline points="20 6 9 17 4 12" />
                      ) : (
                        <><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></>
                      )}
                    </svg>
                    {isWatched ? 'Watched' : 'Mark Watched'}
                  </button>
                  <button
                    className="hero__btn hero__btn--remove"
                    onClick={() => removeFromWatchlist({ variables: { tmdbId: movie.tmdbId } })}
                    disabled={removing}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                      <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Remove
                  </button>
                </>
              ) : (
                <button
                  className="hero__btn hero__btn--add"
                  onClick={() => addToWatchlist({ variables: { tmdbId: movie.tmdbId } })}
                  disabled={adding}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add to Watchlist
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {movie.overview && (
          <section className="detail-section">
            <h2 className="detail-section__title">Overview</h2>
            <p className="detail-overview">{movie.overview}</p>
          </section>
        )}

        {movie.cast && movie.cast.length > 0 && (
          <section className="detail-section">
            <h2 className="detail-section__title">Cast</h2>
            <div className="cast-grid">
              {movie.cast.slice(0, 12).map((c: { name: string; character: string; profileUrl: string }) => (
                <div key={c.name} className="cast-card">
                  <div className="cast-card__avatar">
                    {c.profileUrl ? (
                      <img src={c.profileUrl} alt={c.name} className="cast-card__img" />
                    ) : (
                      <div className="cast-card__placeholder">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="24" height="24">
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="cast-card__info">
                    <span className="cast-card__name">{c.name}</span>
                    <span className="cast-card__char">{c.character}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {recsData?.recommendations && recsData.recommendations.length > 0 && (
          <section>
            <MovieGrid movies={recsData.recommendations} title="You Might Also Like" />
          </section>
        )}
      </div>

      <style>{`
        .hero {
          position: relative;
          border-radius: var(--radius);
          overflow: hidden;
          margin: -1rem -2rem 0;
        }
        .hero__bg {
          width: 100%;
          height: 460px;
          object-fit: cover;
          display: block;
        }
        .hero__bg--fallback {
          height: 460px;
          background: linear-gradient(135deg, var(--bg-elevated) 0%, var(--bg-card) 100%);
        }
        .hero__gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,10,10,0.3) 0%, rgba(10,10,10,0.1) 40%, var(--bg) 100%);
          pointer-events: none;
        }
        .hero__content {
          position: absolute;
          bottom: 0;
          left: 0; right: 0;
          display: flex;
          align-items: flex-end;
          gap: 2rem;
          padding: 2rem;
        }
        .hero__poster-wrapper {
          flex-shrink: 0;
          width: 200px;
          border-radius: var(--radius-sm);
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .hero__poster {
          width: 100%;
          display: block;
        }
        .hero__poster--placeholder {
          aspect-ratio: 2/3;
          background: var(--bg-card);
        }
        .hero__info {
          flex: 1;
          padding-bottom: 0.5rem;
        }
        .hero__title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 400;
          line-height: 1.1;
          color: var(--text);
          margin-bottom: 0.5rem;
        }
        .hero__meta {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 0.75rem;
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .hero__year,
        .hero__runtime {
          position: relative;
        }
        .hero__year::after,
        .hero__runtime::after {
          content: '';
          position: absolute;
          right: -0.55rem;
          top: 50%;
          transform: translateY(-50%);
          width: 3px;
          height: 3px;
          border-radius: 50%;
          background: var(--text-dim);
        }
        .hero__runtime::after { display: none; }
        .hero__rating {
          display: flex;
          align-items: center;
          gap: 0.35rem;
          color: var(--accent);
          font-weight: 600;
        }
        .hero__genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1.25rem;
        }
        .hero__genre {
          padding: 0.3rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.06em;
          border: 1px solid var(--border-light);
          border-radius: var(--radius-pill);
          color: var(--text-muted);
          background: rgba(10,10,10,0.4);
          backdrop-filter: blur(4px);
        }
        .hero__actions {
          display: flex;
          gap: 0.75rem;
        }
        .hero__btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.625rem 1.25rem;
          border: none;
          border-radius: var(--radius-pill);
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background var(--transition), transform var(--transition);
        }
        .hero__btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .hero__btn--add {
          background: var(--accent);
          color: var(--bg);
        }
        .hero__btn--add:hover:not(:disabled) {
          background: var(--accent-dim);
          transform: translateY(-1px);
        }
        .hero__btn--watched {
          background: rgba(212, 168, 67, 0.15);
          color: var(--accent);
          border: 1px solid var(--accent-dim);
        }
        .hero__btn--watched:hover:not(:disabled) {
          background: rgba(212, 168, 67, 0.25);
        }
        .hero__btn--watched.is-watched {
          background: rgba(212, 168, 67, 0.2);
          border-color: var(--accent);
        }
        .hero__btn--remove {
          background: rgba(192, 57, 43, 0.15);
          color: var(--crimson);
          border: 1px solid var(--crimson-dim);
        }
        .hero__btn--remove:hover:not(:disabled) {
          background: rgba(192, 57, 43, 0.25);
        }

        .detail-body {
          padding-top: 1.5rem;
        }
        .detail-section {
          margin-bottom: 2.5rem;
        }
        .detail-section__title {
          font-family: var(--font-display);
          font-size: 1.5rem;
          font-weight: 400;
          color: var(--text);
          margin-bottom: 1rem;
        }
        .detail-overview {
          font-size: 1rem;
          line-height: 1.8;
          color: var(--text-muted);
          max-width: 720px;
        }

        .cast-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 1rem;
        }
        .cast-card {
          display: flex;
          align-items: center;
          gap: 0.875rem;
          padding: 0.75rem;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-sm);
          transition: border-color var(--transition);
        }
        .cast-card:hover {
          border-color: var(--border-light);
        }
        .cast-card__avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          overflow: hidden;
          flex-shrink: 0;
          background: var(--bg-elevated);
        }
        .cast-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .cast-card__placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--text-dim);
        }
        .cast-card__info {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .cast-card__name {
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .cast-card__char {
          font-size: 0.75rem;
          color: var(--text-muted);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        @media (max-width: 768px) {
          .hero { margin: -1rem -1rem 0; }
          .hero__bg { height: 320px; }
          .hero__bg--fallback { height: 320px; }
          .hero__content {
            flex-direction: column;
            align-items: center;
            text-align: center;
            padding: 1.5rem;
          }
          .hero__poster-wrapper { width: 140px; }
          .hero__title { font-size: 1.75rem; }
          .hero__meta { justify-content: center; }
          .hero__genres { justify-content: center; }
          .hero__actions { justify-content: center; flex-wrap: wrap; }
          .cast-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      `}</style>
    </div>
  );
}
