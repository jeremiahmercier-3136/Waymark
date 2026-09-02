import { useEffect, useMemo, useState } from 'react'

type Marker = {
  id: string
  title: string
  category: string
  summary: string
  symptoms: string
  rootCause: string
  resolution: string
  tags: string[]
}

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(path)
  if (!response.ok) throw new Error(`Request failed (${response.status})`)
  return response.json() as Promise<T>
}

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

export function App() {
  const [markers, setMarkers] = useState<Marker[]>()
  const [error, setError] = useState<string>()
  const [activeCategory, setActiveCategory] = useState('All')

  useEffect(() => {
    getJson<Marker[]>('/api/markers')
      .then(setMarkers)
      .catch(() => setError('The marker catalog is unavailable right now.'))
  }, [])

  const categories = useMemo(() => {
    if (!markers) return ['All']
    return ['All', ...Array.from(new Set(markers.map((m) => m.category))).sort()]
  }, [markers])

  const visibleMarkers = useMemo(() => {
    if (!markers) return []
    return activeCategory === 'All' ? markers : markers.filter((m) => m.category === activeCategory)
  }, [markers, activeCategory])

  return (
    <main>
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
          {markers && <span className="count">{visibleMarkers.length}</span>}
        </div>
        <p className="note">
          The markers below are placeholders that illustrate the format - not real project history. Real ones
          get added here as they&rsquo;re found.
        </p>

        {error && <p className="error">{error}</p>}
        {!markers && !error && <p className="loading">Loading markers&hellip;</p>}

        {markers && (
          <>
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
              {visibleMarkers.map((marker) => (
                <details key={marker.id} className="marker-card">
                  <summary>
                    <span className="category">{marker.category}</span>
                    <h3>{marker.title}</h3>
                    <p>{marker.summary}</p>
                    <div className="tags">
                      {marker.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </summary>
                  <div className="marker-detail">
                    <div>
                      <h4>Symptoms</h4>
                      <p>{marker.symptoms}</p>
                    </div>
                    <div>
                      <h4>Root cause</h4>
                      <p>{marker.rootCause}</p>
                    </div>
                    <div>
                      <h4>Resolution</h4>
                      <p>{marker.resolution}</p>
                    </div>
                  </div>
                </details>
              ))}
            </div>
          </>
        )}
      </section>

      <footer>
        <p>
          Waymark is a personal reference project - a starting point, not a finished catalog. Source on{' '}
          <a href="https://github.com/jeremiahmercier-3136/Waymark">GitHub</a>.
        </p>
      </footer>
    </main>
  )
}
