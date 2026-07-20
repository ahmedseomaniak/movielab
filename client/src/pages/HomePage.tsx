import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import MovieGrid from '../components/MovieGrid';
import { useSearchMovies, useTrendingMovies } from '../hooks/useMovies';

export default function HomePage() {
  const [query, setQuery] = useState('');
  const { data: searchData } = useSearchMovies(query);
  const { loading, data: trendingData } = useTrendingMovies();

  return (
    <div>
      <SearchBar onSearch={setQuery} />

      {query ? (
        searchData?.searchMovies ? (
          <MovieGrid movies={searchData.searchMovies} title="Search Results" />
        ) : query && !searchData ? (
          <MovieGrid loading title="Search Results" />
        ) : null
      ) : (
        <MovieGrid movies={trendingData?.trendingMovies} title="Trending This Week" loading={loading} />
      )}
    </div>
  );
}
