import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { client } from './apolloClient';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import WatchlistPage from './pages/WatchlistPage';
import DiscoverPage from './pages/DiscoverPage';

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <nav style={{ padding: '1rem', display: 'flex', gap: '1rem', borderBottom: '1px solid #ccc' }}>
          <Link to="/">Home</Link>
          <Link to="/watchlist">Watchlist</Link>
          <Link to="/discover">Discover</Link>
        </nav>
        <main style={{ padding: '1rem' }}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:tmdbId" element={<MoviePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </main>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
