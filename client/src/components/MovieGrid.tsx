import MovieCard from './MovieCard';

interface MovieItem {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
  genres?: string[];
}

interface Props {
  movies?: MovieItem[];
  title?: string;
  loading?: boolean;
}

export default function MovieGrid({ movies, title, loading }: Props) {
  if (loading) {
    return (
      <section className="movie-grid-section">
        {title && <h2 className="movie-grid-title">{title}</h2>}
        <div className="movie-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="movie-grid__skeleton" />
          ))}
        </div>
        <style>{`
          .movie-grid__skeleton {
            aspect-ratio: 2 / 3;
            border-radius: var(--radius);
            background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-hover) 50%, var(--bg-card) 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s ease-in-out infinite;
          }
        `}</style>
      </section>
    );
  }

  if (!movies || movies.length === 0) return null;

  return (
    <section className="movie-grid-section">
      {title && (
        <div className="movie-grid-header">
          <h2 className="movie-grid-title">{title}</h2>
          <span className="movie-grid-count">{movies.length} film{movies.length !== 1 ? 's' : ''}</span>
        </div>
      )}
      <div className="movie-grid">
        {movies.map((m, i) => (
          <MovieCard key={m.tmdbId} {...m} index={i} />
        ))}
      </div>
      <style>{`
        .movie-grid-section {
          margin-bottom: 3rem;
          animation: fadeUp 0.6s ease-out;
        }
        .movie-grid-header {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .movie-grid-title {
          font-family: var(--font-display);
          font-size: 1.75rem;
          font-weight: 400;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .movie-grid-count {
          font-size: 0.85rem;
          color: var(--text-dim);
          font-weight: 400;
        }
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 1.25rem;
        }
        @media (max-width: 480px) {
          .movie-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.75rem;
          }
          .movie-grid-title { font-size: 1.4rem; }
        }
      `}</style>
    </section>
  );
}
