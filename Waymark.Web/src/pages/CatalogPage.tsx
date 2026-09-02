import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { markers } from '../content/markers/registry'

const steps = [
  {
    title: 'Encounter',
    detail: 'A problem shows up in a live project - a flaky deploy step, an odd framework edge case, a tool that breaks quietly on upgrade.',
  },
  {
    title: 'Record',
    detail: 'It gets written down once, here: what it looked like, why it happened, and exactly what fixed it.',
  },
  {
    title: 'Reuse',
    detail: 'The next project - or this one, months later - finds the answer in minutes instead of solving it from scratch again.',
  },
]

export function CatalogPage() {
  const [activeCategory, setActiveCategory] = useState('All')

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(markers.map((m) => m.meta.category))).sort()],
    [],
  )

  const visibleMarkers = useMemo(
    () => (activeCategory === 'All' ? markers : markers.filter((m) => m.meta.category === activeCategory)),
    [activeCategory],
  )

  return (
    <>
      <header className="hero">
        <div className="brand">
          <img src="/favicon.svg" alt="" width={44} height={44} />
          <div>
            <p className="eyebrow">Reference library</p>
            <h1>Waymark</h1>
          </div>
        </div>
        <p className="lede">
          A field guide to problems already solved - so the next project doesn&rsquo;t have to solve them again.
        </p>
        <p className="lede lede-secondary">
          Every project runs into the same handful of problems in a slightly different disguise. Waymark is where
          those problems get written down once - the symptom, the cause, and the fix - so future work starts from
          the answer instead of rediscovering it.
        </p>
      </header>

      <section className="how-it-works">
        <p className="eyebrow">How it works</p>
        <ol>
          {steps.map((step, index) => (
            <li key={step.title}>
              <span className="step-number">{index + 1}</span>
              <div>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="markers">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Markers</p>
            <h2>Catalog</h2>
          </div>
          <span className="count">{visibleMarkers.length}</span>
        </div>
        <p className="note">
          Markers labeled <strong>Illustrative</strong> are placeholders that demonstrate the format, not real
          project history. Unlabeled markers are real, drawn from problems or decisions actually made in this
          workspace.
        </p>

        <div className="filters" role="group" aria-label="Filter by category">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              className={category === activeCategory ? 'chip chip-active' : 'chip'}
              onClick={() => setActiveCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="marker-grid">
          {visibleMarkers.map(({ meta }) => (
            <Link key={meta.id} to={`/markers/${meta.id}`} className="marker-card">
              <span className="category">{meta.category}</span>
              {meta.isIllustrative && <span className="illustrative-badge">Illustrative</span>}
              <h3>{meta.title}</h3>
              <p>{meta.summary}</p>
              <div className="tags">
                {meta.tags.map((tag) => (
                  <span key={tag} className="tag">
                    {tag}
                  </span>
                ))}
              </div>
            </Link>
          ))}
        </div>
      </section>

      <footer>
        <p>
          Waymark is a personal reference project - a starting point, not a finished catalog. Source on{' '}
          <a href="https://github.com/jeremiahmercier-3136/Waymark">GitHub</a>.
        </p>
      </footer>
    </>
  )
}
