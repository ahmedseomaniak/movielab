import { useNavigate } from 'react-router-dom';

interface Props {
  tmdbId: number;
  title: string;
  posterUrl?: string | null;
  voteAverage?: number;
  releaseDate?: string;
}

const placeholderPoster = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 450"><rect fill="%23ddd" width="300" height="450"/><text fill="%23999" x="150" y="225" text-anchor="middle" font-family="sans-serif">No Poster</text></svg>';

export default function MovieCard({ tmdbId, title, posterUrl, voteAverage, releaseDate }: Props) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/movie/${tmdbId}`)}
      style={{
        cursor: 'pointer',
        border: '1px solid #ddd',
        borderRadius: '8px',
        overflow: 'hidden',
        width: '200px',
      }}
    >
      <img
        src={posterUrl || placeholderPoster}
        alt={title}
        style={{ width: '100%', height: '300px', objectFit: 'cover' }}
      />
      <div style={{ padding: '0.5rem' }}>
        <h4 style={{ margin: 0, fontSize: '0.9rem' }}>{title}</h4>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#666' }}>
          <span>{releaseDate?.substring(0, 4)}</span>
          <span>★ {voteAverage?.toFixed(1)}</span>
        </div>
      </div>
    </div>
  );
}
