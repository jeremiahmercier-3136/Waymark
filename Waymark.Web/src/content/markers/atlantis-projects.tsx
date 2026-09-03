import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'atlantis-projects',
  title: 'A new project goes live on Atlantis Technologies too',
  category: 'Process',
  summary:
    "A project can be built, deployed, and working, and still be invisible - nothing connects finishing it to listing it anywhere, so it only shows up if someone remembers to add it separately.",
  tags: ['atlantis-technologies', 'process'],
  isIllustrative: false,
}

export default function AtlantisProjectsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A project reaches a real, deployed, working state, but the portfolio site
          (atlantis-technologies.com) still doesn't mention it - not because anyone decided to
          leave it off, just because nothing about finishing a project prompts adding it anywhere
          else.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Listing a new project on Atlantis Technologies is a separate, manual step in a different
          repository from the project itself, with nothing connecting the two - so it depends on
          remembering to do it, every time.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          When a new project reaches a real, working, deployed state, add it to Atlantis
          Technologies the same way Cadence and Avantra were added before it: a project card in{' '}
          <code>AtlantisTech.Web/src/App.tsx</code>'s projects section (type, title, pitch, tech
          stack, live-site link), and an entry in <code>AtlantisTech.Api/Program.cs</code>'s{' '}
          <code>site-status</code> list so the portfolio's own status page monitors it too.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          This project's own card, added to AtlantisTech when this marker was written - see{' '}
          <a href="https://github.com/jeremiahmercier-3136/AtlantisTech/blob/main/AtlantisTech.Web/src/App.tsx">
            AtlantisTech.Web/src/App.tsx
          </a>
          .
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AtlantisTech.Web/src/App.tsx - project card',
              language: 'tsx',
              code: `<article className="project-card">
  <div className="project-number">05</div>
  <div className="project-content">
    <p className="project-type">Developer tooling · Institutional knowledge · Documentation</p>
    <h3>Waymark</h3>
    <p className="project-lede">
      A field guide to problems already solved, so the next project starts from the
      answer instead of rediscovering it.
    </p>
    <ul className="project-stack" aria-label="Waymark technology stack">
      <li>ASP.NET Core</li>
      <li>React & TypeScript</li>
      <li>Vite</li>
      <li>Vitest</li>
      <li>GitHub Actions</li>
    </ul>
  </div>
  <a className="project-link" href="https://waymark.cc/" target="_blank" rel="noreferrer">
    <span>Visit live site</span>
    <strong>{'↗'}</strong>
  </a>
</article>`,
            }}
          />
          <CodeBlock
            example={{
              label: 'AtlantisTech.Api/Program.cs - status monitor entry',
              language: 'csharp',
              code: `new Site("Waymark", "https://waymark.cc/", "https://waymark.cc/api/health")`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
