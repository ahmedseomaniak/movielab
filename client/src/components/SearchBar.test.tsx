import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter } from 'react-router-dom'
import SearchBar from './SearchBar'

describe('SearchBar', () => {
  it('renders search input', () => {
    render(<SearchBar onSearch={() => {}} />)
    expect(screen.getByPlaceholderText('Search by title...')).toBeInTheDocument()
  })

  it('calls onSearch with the query on submit', async () => {
    const onSearch = vi.fn()
    const user = userEvent.setup()
    render(<SearchBar onSearch={onSearch} />)
    const input = screen.getByPlaceholderText('Search by title...')
    await user.type(input, 'Inception')
    await user.click(screen.getByRole('button'))
    expect(onSearch).toHaveBeenCalledWith('Inception')
  })
})
