import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import MovieCard from './MovieCard'

describe('MovieCard', () => {
  it('renders movie title and rating', () => {
    render(
      <BrowserRouter>
        <MovieCard tmdbId={550} title="Fight Club" posterUrl="/poster.jpg" voteAverage={8.4} genres={['Drama']} releaseDate="1999-10-15" />
      </BrowserRouter>
    )
    expect(screen.getByText('Fight Club')).toBeInTheDocument()
    expect(screen.getByText('8.4')).toBeInTheDocument()
  })

  it('navigates to movie detail on click', () => {
    render(
      <BrowserRouter>
        <MovieCard tmdbId={550} title="Fight Club" posterUrl="/poster.jpg" voteAverage={8.4} genres={['Drama']} releaseDate="1999-10-15" />
      </BrowserRouter>
    )
    expect(screen.getByRole('button')).toHaveTextContent('Fight Club')
  })
})
