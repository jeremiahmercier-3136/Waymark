import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, describe, expect, it } from 'vitest'
import { markers } from '../content/markers/registry'
import { CatalogPage } from './CatalogPage'

describe('CatalogPage', () => {
  afterEach(cleanup)

  it('lists every marker in the registry', () => {
    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    )

    for (const { meta } of markers) {
      expect(screen.getByRole('heading', { name: meta.title })).toBeInTheDocument()
    }
    expect(screen.getAllByRole('link').filter((el) => el.className.includes('marker-card'))).toHaveLength(
      markers.length,
    )
  })

  it('filters the catalog down to one category', async () => {
    const user = userEvent.setup()
    const dataMarkers = markers.filter((m) => m.meta.category === 'Data')
    const otherMarker = markers.find((m) => m.meta.category !== 'Data')
    expect(dataMarkers.length).toBeGreaterThan(0)
    expect(otherMarker).toBeDefined()

    render(
      <MemoryRouter>
        <CatalogPage />
      </MemoryRouter>,
    )

    await user.click(screen.getByRole('button', { name: 'Data' }))

    for (const { meta } of dataMarkers) {
      expect(screen.getByRole('heading', { name: meta.title })).toBeInTheDocument()
    }
    expect(screen.queryByRole('heading', { name: otherMarker!.meta.title })).not.toBeInTheDocument()
  })
})
