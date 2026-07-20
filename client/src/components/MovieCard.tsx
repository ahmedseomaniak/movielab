import { useNavigate } from 'react-router-dom';

interface Props {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  genres?: string[];
  index?: number;
}

const placeholderPoster = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%231a1a1e" width="300" height="450"/><text fill="%235a5650" x="150" y="225" text-anchor="middle" font-family="sans-serif" font-size="14">No Poster</text></svg>';

export default function MovieCard({ tmdbId, title, posterUrl, voteAverage, releaseDate, genres, index = 0 }: Props) {
  const navigate = useNavigate();
  const year = releaseDate?.substring(0, 4);

  return (
    <article
      className="movie-card"
      onClick={() => navigate(`/movie/${tmdbId}`)}
      style={{ animationDelay: `${index * 0.06}s` }}
      role="button"
      tabIndex={0}
      onKeyDown={e => e.key === 'Enter' && navigate(`/movie/${tmdbId}`)}
    >
      <div className="movie-card__poster">
        <img
          src={posterUrl || placeholderPoster}
          alt={title}
          loading="lazy"
          className="movie-card__img"
        />
        <div className="movie-card__overlay" />
        {voteAverage != null && voteAverage > 0 && (
          <div className="movie-card__rating">
            <svg viewBox="0 0 20 20" fill="currentColor" width="12" height="12">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {voteAverage.toFixed(1)}
          </div>
        )}
      </div>
      <div className="movie-card__info">
        <h3 className="movie-card__title">{title}</h3>
        <div className="movie-card__meta">
          {year && <span className="movie-card__year">{year}</span>}
          {genres && genres.length > 0 && (
            <span className="movie-card__genres">{genres.slice(0, 2).join(', ')}</span>
          )}
        </div>
      </div>
      <style>{`
        .movie-card {
          cursor: pointer;
          border-radius: var(--radius);
          overflow: hidden;
          background: var(--bg-card);
          border: 1px solid var(--border);
          transition: transform var(--transition), box-shadow var(--transition), border-color var(--transition);
          animation: fadeUp 0.5s ease-out both;
          outline: none;
          width: 100%;
        }
        .movie-card:hover,
        .movie-card:focus-visible {
          transform: translateY(-6px);
          box-shadow: var(--shadow-card), var(--shadow-glow);
          border-color: var(--accent-dim);
        }
        .movie-card__poster {
          position: relative;
          aspect-ratio: 2 / 3;
          overflow: hidden;
          background: var(--bg-elevated);
        }
        .movie-card__img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }
        .movie-card:hover .movie-card__img {
          transform: scale(1.05);
        }
        .movie-card__overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, transparent 50%, rgba(10, 10, 10, 0.85) 100%);
          pointer-events: none;
        }
        .movie-card__rating {
          position: absolute;
          top: 0.625rem;
          right: 0.625rem;
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.3rem 0.6rem;
          background: rgba(10, 10, 10, 0.75);
          backdrop-filter: blur(4px);
          border-radius: var(--radius-pill);
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--accent);
          letter-spacing: 0.02em;
        }
        .movie-card__info {
          padding: 0.875rem 1rem 1rem;
        }
        .movie-card__title {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text);
          line-height: 1.3;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .movie-card__meta {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-top: 0.375rem;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .movie-card__year {
          font-weight: 500;
        }
        .movie-card__genres {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </article>
  );
}
