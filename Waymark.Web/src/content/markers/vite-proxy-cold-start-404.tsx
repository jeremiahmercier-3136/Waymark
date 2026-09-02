import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'vite-proxy-cold-start-404',
  title: 'Vite dev proxy 404s on cold start',
  category: 'Tooling',
  summary:
    "The first request to /api after starting the dev server 404s because Vite's proxy starts before the API is listening.",
  tags: ['vite', 'dev-server', 'proxy'],
  isIllustrative: true,
}

export default function ViteProxyColdStart404Page() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Opening the web app right after `npm run dev` shows a failed fetch or 404 for the first
          API call; reloading the page fixes it.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Vite's dev server accepts connections before the proxied backend is ready, so the very
          first proxied request has nothing to reach.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Gate the frontend start behind a TCP wait on the API's port (e.g. wait-on) instead of
          starting both processes at the same instant.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Problem',
              language: 'json',
              code: `{
  "scripts": {
    "dev": "concurrently \\"dotnet run --project Api\\" \\"vite\\""
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Fix',
              language: 'json',
              code: `{
  "scripts": {
    "dev": "concurrently \\"dotnet run --project Api\\" \\"wait-on tcp:5119 && vite\\""
  }
}`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
