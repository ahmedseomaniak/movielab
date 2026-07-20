import { ApolloProvider } from '@apollo/client';
import { BrowserRouter, Routes, Route, NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { client } from './apolloClient';
import HomePage from './pages/HomePage';
import MoviePage from './pages/MoviePage';
import WatchlistPage from './pages/WatchlistPage';
import DiscoverPage from './pages/DiscoverPage';

function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  return (
    <nav className={`nav${scrolled ? ' nav--scrolled' : ''}`}>
      <div className="nav__inner">
        <NavLink to="/" className="nav__logo">MovieLab</NavLink>
        <div className="nav__links">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
            Browse
          </NavLink>
          <NavLink to="/watchlist" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
            Watchlist
          </NavLink>
          <NavLink to="/discover" className={({ isActive }) => isActive ? 'nav__link nav__link--active' : 'nav__link'}>
            Discover
          </NavLink>
        </div>
      </div>
      <style>{`
        .nav {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 100;
          padding: 0 2rem;
          transition: background var(--transition), box-shadow var(--transition);
          background: transparent;
        }
        .nav--scrolled {
          background: rgba(10, 10, 10, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 1px 0 var(--border);
        }
        .nav__inner {
          max-width: 1280px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: 64px;
        }
        .nav__logo {
          font-family: var(--font-display);
          font-size: 1.6rem;
          color: var(--accent) !important;
          letter-spacing: 0.02em;
          transition: color var(--transition);
        }
        .nav__logo:hover {
          color: var(--text) !important;
        }
        .nav__links {
          display: flex;
          gap: 2rem;
        }
        .nav__link {
          font-family: var(--font-body);
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--text-muted) !important;
          text-transform: uppercase;
          letter-spacing: 0.12em;
          position: relative;
          padding: 0.25rem 0;
          transition: color var(--transition);
        }
        .nav__link::after {
          content: '';
          position: absolute;
          bottom: -2px; left: 0; right: 0;
          height: 1.5px;
          background: var(--accent);
          transform: scaleX(0);
          transition: transform var(--transition);
        }
        .nav__link:hover {
          color: var(--text) !important;
        }
        .nav__link--active {
          color: var(--text) !important;
        }
        .nav__link--active::after {
          transform: scaleX(1);
        }
        @media (max-width: 640px) {
          .nav { padding: 0 1rem; }
          .nav__inner { height: 56px; }
          .nav__logo { font-size: 1.3rem; }
          .nav__links { gap: 1.25rem; }
          .nav__link { font-size: 0.75rem; }
        }
      `}</style>
    </nav>
  );
}

function App() {
  return (
    <ApolloProvider client={client}>
      <BrowserRouter>
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/movie/:tmdbId" element={<MoviePage />} />
            <Route path="/watchlist" element={<WatchlistPage />} />
            <Route path="/discover" element={<DiscoverPage />} />
          </Routes>
        </main>
        <style>{`
          .main {
            max-width: 1280px;
            margin: 0 auto;
            padding: 96px 2rem 4rem;
            min-height: 100vh;
            animation: fadeUp 0.6s ease-out;
          }
          @media (max-width: 640px) {
            .main { padding: 80px 1rem 3rem; }
          }
        `}</style>
      </BrowserRouter>
    </ApolloProvider>
  );
}

export default App;
