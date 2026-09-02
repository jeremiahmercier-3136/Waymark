import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'react-state-update-after-unmount',
  title: 'React state update warning after unmount',
  category: 'Frontend',
  summary:
    "An async fetch resolves after its component has already unmounted and tries to set state, logging a warning and risking a memory leak.",
  tags: ['react', 'effects', 'async'],
  isIllustrative: true,
}

export default function ReactStateUpdateAfterUnmountPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Console warning about updating state on an unmounted component, usually after navigating
          away quickly during a slow request.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>The fetch's `.then` callback has no way to know the component is gone by the time it runs.</p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Track a cancellation flag (or AbortController) in the effect's cleanup function and check
          it before calling any state setter.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Problem',
              language: 'tsx',
              code: `useEffect(() => {
  fetch(\`/api/items/\${id}\`)
    .then((r) => r.json())
    .then(setItem) // may run after unmount
}, [id])`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Fix',
              language: 'tsx',
              code: `useEffect(() => {
  const controller = new AbortController()
  fetch(\`/api/items/\${id}\`, { signal: controller.signal })
    .then((r) => r.json())
    .then(setItem)
    .catch((err) => {
      if (err.name !== 'AbortError') throw err
    })
  return () => controller.abort()
}, [id])`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
