import { useState, useRef, useEffect } from 'react';

interface Props {
  onSearch: (query: string) => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, initialQuery }: Props) {
  const [value, setValue] = useState(initialQuery || '');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSearch(value.trim());
  };

  return (
    <div className="search-section">
      <h1 className="search-heading">
        Find your next
        <span className="search-heading__accent"> film</span>
      </h1>
      <p className="search-subtitle">Browse thousands of movies, discover hidden gems</p>
      <form className={`search-form${focused ? ' search-form--focused' : ''}${value ? ' search-form--has-value' : ''}`} onSubmit={handleSubmit}>
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Search by title..."
          className="search-input"
        />
        <div className="search-hint">
          {!value && <kbd className="search-kbd">⌘K</kbd>}
        </div>
        {value && (
          <button type="submit" className="search-submit" aria-label="Search">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="18" height="18">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </form>
      <style>{`
        .search-section {
          padding: 3rem 0 2.5rem;
          text-align: center;
          animation: fadeUp 0.6s ease-out;
        }
        .search-heading {
          font-family: var(--font-display);
          font-size: 3.5rem;
          font-weight: 400;
          line-height: 1.15;
          margin-bottom: 0.5rem;
          color: var(--text);
          letter-spacing: -0.01em;
        }
        .search-heading__accent {
          color: var(--accent);
          font-style: italic;
        }
        .search-subtitle {
          color: var(--text-muted);
          font-size: 1.05rem;
          margin-bottom: 2rem;
          font-weight: 300;
        }
        .search-form {
          display: flex;
          align-items: center;
          max-width: 560px;
          margin: 0 auto;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: var(--radius-pill);
          padding: 0.625rem 0.625rem 0.625rem 1.25rem;
          transition: border-color var(--transition), box-shadow var(--transition);
          position: relative;
        }
        .search-form--focused {
          border-color: var(--accent-dim);
          box-shadow: 0 0 0 3px var(--accent-glow);
        }
        .search-form--has-value {
          border-color: var(--border-light);
        }
        .search-icon {
          width: 20px;
          height: 20px;
          color: var(--text-muted);
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          background: none;
          border: none;
          outline: none;
          font-family: var(--font-body);
          font-size: 1rem;
          color: var(--text);
          padding: 0.5rem 0.75rem;
        }
        .search-input::placeholder {
          color: var(--text-dim);
        }
        .search-hint {
          display: flex;
          align-items: center;
          flex-shrink: 0;
        }
        .search-kbd {
          font-family: var(--font-body);
          font-size: 0.7rem;
          padding: 0.2rem 0.5rem;
          background: var(--bg-hover);
          border: 1px solid var(--border);
          border-radius: 4px;
          color: var(--text-dim);
          letter-spacing: 0.05em;
        }
        .search-submit {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border: none;
          border-radius: 50%;
          background: var(--accent);
          color: var(--bg);
          cursor: pointer;
          transition: background var(--transition), transform var(--transition);
          flex-shrink: 0;
        }
        .search-submit:hover {
          background: var(--accent-dim);
          transform: scale(1.05);
        }
        @media (max-width: 640px) {
          .search-section { padding: 2rem 0 1.5rem; }
          .search-heading { font-size: 2.2rem; }
          .search-subtitle { font-size: 0.9rem; }
        }
      `}</style>
    </div>
  );
}
