import { Link } from 'react-router-dom'
import type { MarkerMeta } from '../content/markers/types'

export function MarkerPageHeader({ meta }: { meta: MarkerMeta }) {
  return (
    <>
      <Link to="/" className="back-link">
        &larr; Back to catalog
      </Link>

      <header className="marker-page-header">
        <span className="category">{meta.category}</span>
        {meta.isIllustrative && <span className="illustrative-badge">Illustrative</span>}
        <h1>{meta.title}</h1>
        <p className="lede">{meta.summary}</p>
        {meta.isIllustrative && (
          <p className="note">This marker illustrates the format - it isn&rsquo;t drawn from real project history.</p>
        )}
        <div className="tags">
          {meta.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      </header>
    </>
  )
}
