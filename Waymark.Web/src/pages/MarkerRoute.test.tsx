import { cleanup, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { markers } from '../content/markers/registry'
import { MarkerRoute } from './MarkerRoute'

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/markers/:id" element={<MarkerRoute />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('MarkerRoute', () => {
  afterEach(cleanup)

  it("renders a known marker's page", () => {
    const [{ meta }] = markers
    renderAt(`/markers/${meta.id}`)

    expect(screen.getByRole('heading', { level: 1, name: meta.title })).toBeInTheDocument()
  })

  it('shows a not-found message for an unknown id', () => {
    renderAt('/markers/does-not-exist')

    expect(screen.getByRole('heading', { level: 1, name: /does-not-exist/ })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to catalog/i })).toHaveAttribute('href', '/')
  })
})
