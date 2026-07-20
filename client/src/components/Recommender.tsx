import { useState } from 'react';
import { useDiscoverMovies } from '../hooks/useMovies';
import MovieGrid from './MovieGrid';

const GENRES = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

export default function Recommender() {
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [minRating, setMinRating] = useState(0);
  const [search, setSearch] = useState(false);

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

  return (
    <div>
      <h1>Discover Movies</h1>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Genres</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
          {GENRES.map(g => (
            <button
              key={g.id}
              onClick={() => toggleGenre(g.id)}
              style={{
                padding: '0.3rem 0.8rem',
                background: selectedGenres.includes(g.id) ? '#007bff' : '#eee',
                color: selectedGenres.includes(g.id) ? 'white' : 'black',
                border: '1px solid #ccc',
                borderRadius: '16px',
                cursor: 'pointer',
              }}
            >
              {g.name}
            </button>
          ))}
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <h3>Minimum Rating: {minRating}</h3>
        <input
          type="range"
          min="0"
          max="10"
          step="0.5"
          value={minRating}
          onChange={e => setMinRating(parseFloat(e.target.value))}
        />
      </div>

      <button onClick={() => setSearch(true)}>Discover</button>

      {search && loading && <p>Loading...</p>}
      {search && error && <p>Error: {error.message}</p>}
      {search && data?.discoverMovies && (
        <div style={{ marginTop: '1rem' }}>
          <MovieGrid movies={data.discoverMovies} title="Results" />
        </div>
      )}
    </div>
  );
}
