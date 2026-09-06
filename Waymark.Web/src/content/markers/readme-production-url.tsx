import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'readme-production-url',
  title: "State the project's live URL in its README, next to how it deploys",
  category: 'Process',
  summary:
    "MedServ, ModelMosaic, DMGPT, Runbook, and Avantra's READMEs all say where the site is live. The four personal sites, Cadence, and AtlantisTech document the deploy mechanism - the pipeline, the repository variables, the secret it needs - in real detail, and never once state the URL that mechanism actually produces.",
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
          The four personal sites' <code>README.md</code> "Deployment" sections describe the
          myasp.net pipeline, the repository variables, and the secret it needs, in real detail -
          and never once state <code>jeremiahmercier.com</code>, <code>ravenfrost.com</code>,{' '}
          <code>andrerene.com</code>, or <code>lucnathanael.com</code>. Cadence's "Production
          configuration and notifications" section covers connection strings, VAPID keys, and push
          credentials at length without ever stating <code>meetcaden.site</code> - it only shows up
          incidentally, in a privacy-policy link. AtlantisTech's README names its own domain
          exactly once, in the opening sentence, never under a deployment or production heading.
          Finding out where any of these five actually run means reading the deploy workflow's
          repository variables or asking whoever set it up, not opening the README.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          MedServ, ModelMosaic, DMGPT, Runbook, and Avantra's READMEs all state their live URL,
          but only because each of them already needed it for something else - a health-check
          path, a webhook target, a privacy-policy link - not because "state the URL" was ever a
          rule of its own. Nothing said a README has to state where a project is live, only that it
          should document how to deploy it, so the two habits split apart: writing about a pipeline
          happens naturally while building it, and the URL that pipeline produces gets left out
          once the site is already running and nobody's re-reading the README.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          State the project's public URL under the same "Deployment" (or "Production") heading
          that already documents the deploy mechanism - one line, right next to it, the same place
          MedServ, ModelMosaic, DMGPT, Runbook, and Avantra already put it.
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
          Added to JeremiahMercier, Ravenfrost, AndreRene, LucNathanael, Cadence, and AtlantisTech.
          Bizfront is a separate case: it has three deployable tracks (Main at{' '}
          <code>bizfront.cc</code>, plus <code>orchard.bizfront.cc</code> and{' '}
          <code>umbraco.bizfront.cc</code>) still in active side-by-side evaluation, so its own
          README defers to each track's README rather than stating one URL itself.
        </p>
      </section>
    </article>
  )
}
