import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'dev-scripts',
  title: 'One command to start API + UI, on ports nothing else uses',
  category: 'Tooling',
  summary:
    'Running the API and UI as two manual commands is easy to get wrong, and this workspace\'s projects default to the same handful of ports, so running more than one at once collides.',
  tags: ['npm', 'concurrently', 'wait-on', 'ports', 'dev-server'],
  isIllustrative: false,
}

export default function DevScriptsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Starting a project locally means remembering to run two separate commands in two
          terminals - <code>dotnet run</code> for the API, <code>npm run dev</code> for the UI -
          and if the UI starts first, its dev proxy accepts requests before the API is listening,
          so the first API call fails. Separately, running two of this workspace's projects side
          by side (to compare or test them together) fails to start one of them, because their
          default Vite and Kestrel ports collide - this project's own web dev server was on port
          5178, already claimed by two other projects, until this marker was written.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Each project's dev ports were picked without checking what the rest of the workspace was
          already using, and starting the API and UI processes at the same instant gives the UI's
          dev proxy nothing to reach for its first request.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          A root <code>package.json</code> <code>dev</code> script runs <code>concurrently</code>{' '}
          over an <code>api</code> script and a <code>web:wait</code> script - the latter blocks on{' '}
          <code>wait-on</code> against the API's port or health endpoint before starting the UI, so
          <code>npm run dev</code> always brings the API up first and only starts the UI once it's
          actually reachable. <code>--kill-others</code> means stopping one stops both.
        </p>
        <p>
          Before assigning ports to a new project, check the table below and pick numbers nothing
          else in the workspace is using yet - then record them here.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Taken directly from this project's root package.json.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'package.json (root) - API-first, single-command dev',
              language: 'json',
              code: `{
  "scripts": {
    "api": "dotnet run --project Waymark.Api",
    "web": "npm --prefix Waymark.Web run dev",
    "web:wait": "wait-on tcp:localhost:5119 && npm run web",
    "dev": "concurrently --kill-others --names API,WEB --prefix-colors blue,magenta \\"npm run api\\" \\"npm run web:wait\\""
  },
  "devDependencies": { "concurrently": "^10.0.4", "wait-on": "^9.1.0" }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Workspace port registry - check before picking a new port',
              language: 'text',
              code: `Project        API port   Web/UI port
AtlantisTech    5062       5173
Cadence         5120       5174
Avantra         5115       5175
MedServ         5132       5176
Virtual911      5116       5177  (Virtual911.Cad)
ModelMosaic     5110       5178
Runbook         5117       5178  <- collided with ModelMosaic
Waymark         5119       5179  <- was 5178, collided with both above
JeremiahMercier 5121       5180
Ravenfrost      5122       5181
AndreRene       5123       5182
LucNathanael    5124       5183`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
