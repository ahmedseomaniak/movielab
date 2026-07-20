import { useState } from 'react';
import { useDiscoverMovies } from '../hooks/useMovies';
import MovieGrid from './MovieGrid';

const GENRES = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' }, { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' }, { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' }, { id: 36, name: 'History' },
  { id: 27, name: 'Horror' }, { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' }, { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' }, { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' }, { id: 37, name: 'Western' },
];

export default function Recommender() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(5);
  const [searched, setSearched] = useState(false);

  const { loading, error, data } = useDiscoverMovies(
    selectedGenres.length > 0 ? selectedGenres : undefined,
    minRating > 0 ? minRating : undefined,
    1
  );

  const toggleGenre = (id: number) => {
    setSelectedGenres(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleDiscover = () => {
    setSearched(true);
  };

  return (
    <div className="discover">
      <div className="discover__header">
        <h1 className="discover__title">Discover Films</h1>
        <p className="discover__subtitle">Find something new by genre and rating</p>
      </div>

      <div className="discover__filters">
        <div className="discover__section">
          <h3 className="discover__label">
            Genres
            {selectedGenres.length > 0 && (
              <span className="discover__label-count">{selectedGenres.length} selected</span>
            )}
          </h3>
          <div className="discover__genres">
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => toggleGenre(g.id)}
                className={`discover__genre${selectedGenres.includes(g.id) ? ' discover__genre--active' : ''}`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        <div className="discover__section">
          <div className="discover__rating-header">
            <h3 className="discover__label">Minimum Rating</h3>
            <span className="discover__rating-value">{minRating.toFixed(1)}</span>
          </div>
          <div className="discover__slider-wrapper">
            <input
              type="range"
              min="0"
              max="10"
              step="0.5"
              value={minRating}
              onChange={e => setMinRating(parseFloat(e.target.value))}
              className="discover__slider"
            />
            <div className="discover__slider-labels">
              <span>0</span>
              <span>10</span>
            </div>
          </div>
        </div>

        <button className="discover__btn" onClick={handleDiscover}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          Discover
        </button>
      </div>

      {searched && (
        <div className="discover__results">
          {loading && (
            <div className="discover__loading">
              <p>Finding films...</p>
            </div>
          )}
          {error && (
            <div className="discover__error">
              <p>Something went wrong. Try different filters.</p>
            </div>
          )}
          {data?.discoverMovies && data.discoverMovies.length > 0 && (
            <MovieGrid movies={data.discoverMovies} title="Results" />
          )}
          {data?.discoverMovies && data.discoverMovies.length === 0 && (
            <div className="discover__empty">
              <p>No films found. Try adjusting your filters.</p>
            </div>
          )}
        </div>
      )}

      <style>{`
        .discover { animation: fadeUp 0.6s ease-out; }
        .discover__header {
          margin-bottom: 2.5rem;
          text-align: center;
        }
        .discover__title {
          font-family: var(--font-display);
          font-size: 2.5rem;
          font-weight: 400;
          color: var(--text);
        }
        .discover__subtitle {
          color: var(--text-muted);
          font-size: 1rem;
          font-weight: 300;
          margin-top: 0.5rem;
        }
        .discover__filters {
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2rem;
          margin-bottom: 2.5rem;
        }
        .discover__section {
          margin-bottom: 1.75rem;
        }
        .discover__label {
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--text-muted);
          margin-bottom: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .discover__label-count {
          font-size: 0.7rem;
          color: var(--accent);
          font-weight: 500;
          text-transform: none;
          letter-spacing: 0;
        }
        .discover__genres {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .discover__genre {
          padding: 0.45rem 1rem;
          font-family: var(--font-body);
          font-size: 0.85rem;
          font-weight: 500;
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          transition: all var(--transition);
        }
        .discover__genre:hover {
          border-color: var(--border-light);
          color: var(--text);
        }
        .discover__genre--active {
          background: rgba(212, 168, 67, 0.12);
          border-color: var(--accent-dim);
          color: var(--accent);
        }
        .discover__genre--active:hover {
          background: rgba(212, 168, 67, 0.2);
        }
        .discover__rating-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 0.875rem;
        }
        .discover__rating-value {
          font-family: var(--font-display);
          font-size: 1.5rem;
          color: var(--accent);
        }
        .discover__slider-wrapper {
          padding: 0 0.25rem;
        }
        .discover__slider {
          -webkit-appearance: none;
          appearance: none;
          width: 100%;
          height: 4px;
          background: var(--border);
          border-radius: 2px;
          outline: none;
        }
        .discover__slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--bg-card);
          box-shadow: 0 0 0 1px var(--accent-dim);
          transition: transform var(--transition);
        }
        .discover__slider::-webkit-slider-thumb:hover {
          transform: scale(1.15);
        }
        .discover__slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: var(--accent);
          cursor: pointer;
          border: 2px solid var(--bg-card);
          box-shadow: 0 0 0 1px var(--accent-dim);
        }
        .discover__slider-labels {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--text-dim);
          margin-top: 0.5rem;
        }
        .discover__btn {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 2rem;
          background: var(--accent);
          color: var(--bg);
          border: none;
          border-radius: var(--radius-pill);
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 600;
          cursor: pointer;
          transition: background var(--transition), transform var(--transition);
        }
        .discover__btn:hover {
          background: var(--accent-dim);
          transform: translateY(-1px);
        }
        .discover__results {
          animation: fadeUp 0.5s ease-out;
        }
        .discover__loading,
        .discover__error,
        .discover__empty {
          text-align: center;
          padding: 3rem 2rem;
          color: var(--text-muted);
        }
        @media (max-width: 640px) {
          .discover__title { font-size: 1.8rem; }
          .discover__filters { padding: 1.25rem; }
        }
      `}</style>
    </div>
  );
}
