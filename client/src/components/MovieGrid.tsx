import MovieCard from './MovieCard';

interface MovieItem {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
}

interface Props {
  movies: MovieItem[];
  title?: string;
}

export default function MovieGrid({ movies, title }: Props) {
  return (
    <div>
      {title && <h2>{title}</h2>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
        {movies.map(m => (
          <MovieCard key={m.tmdbId} {...m} />
        ))}
      </div>
    </div>
  );
}
