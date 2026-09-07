import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'readme-production-url',
  title: "State the project's live URL in its README, next to how it deploys",
  category: 'Process',
  summary:
    "A README can document a deploy pipeline in real detail - the workflow, the repository variables, the secret it needs - and still never state the URL that pipeline actually produces.",
  tags: ['readme', 'documentation', 'process', 'deployment'],
  isIllustrative: false,
}

export default function ReadmeProductionUrlPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A README's "Deployment" section documents the pipeline, the repository variables, and the
          secret it needs, in real detail - and never once states the URL that pipeline actually
          produces. Finding out where the project is actually live means reading the deploy
          workflow's repository variables or asking whoever set it up, not opening the README.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          A README stating its live URL usually only does so because something else already needed
          it - a health-check path, a webhook target, a privacy-policy link - not because "state the
          URL" was ever a rule of its own. Writing about the pipeline happens naturally while
          building it; the URL that pipeline produces gets left out once the site is already running
          and nobody's re-reading the README.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          State the project's public URL under the same "Deployment" (or "Production") heading that
          already documents the deploy mechanism - one line, right next to it.
        </p>
        <p className="note">
          This is about the site's own public address specifically - the thing a browser goes to.
          It's not license to document backend infrastructure the same way: a production database
          hostname or port (MedServ's README names its Postgres host, for example) exists for the
          operator's convenience, not because anything needs it public, and doesn't carry the same
          "obviously belongs in the README" logic a web URL does. Keep documenting the site's own
          address; don't take that as a reason to start writing down what's behind it.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">The minimum every project's README needs, next to its deploy mechanism.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'README.md',
              language: 'markdown',
              code: `## Deployment

Production: <https://myapp.example.com/>

[... the deploy mechanism itself - workflow, repository variables, secrets ...]`,
            }}
          />
          <CodeBlock
            example={{
              label: 'DMGPT/README.md - the same pattern, already in place',
              language: 'markdown',
              code: `## Deployment

Live at [https://dmgpt.cc/](https://dmgpt.cc/), hosted on myasp.net. A push to \`main\` that touches
the API, web app, their tests, \`Dmgpt.slnx\`, or the deploy workflow itself triggers
\`.github/workflows/deploy.yml\` automatically; it can also be run manually via \`workflow_dispatch\`.`,
            }}
          />
        </div>
        <p className="note">
          A project with multiple deployable tracks under active side-by-side evaluation can defer
          to each track's own README rather than stating one URL at the top level.
        </p>
      </section>
    </article>
  )
}
