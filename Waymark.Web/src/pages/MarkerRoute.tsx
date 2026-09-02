import { Link, useParams } from 'react-router-dom'
import { markers } from '../content/markers/registry'

export function MarkerRoute() {
  const { id } = useParams<{ id: string }>()
  const entry = markers.find((m) => m.meta.id === id)

  if (!entry) {
    return (
      <>
        <Link to="/" className="back-link">
          &larr; Back to catalog
        </Link>
        <div className="not-found">
          <p className="eyebrow">Not found</p>
          <h1>No marker matches &ldquo;{id}&rdquo;</h1>
          <p>It may have been renamed or removed. Head back to the catalog to find it.</p>
        </div>
      </>
    )
  }

  const Page = entry.Component
  return <Page />
}
