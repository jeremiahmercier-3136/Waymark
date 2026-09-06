import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'readme-production-url',
  title: "A project's README states where it's actually live, not just how it deploys",
  category: 'Process',
  summary:
    "MedServ, ModelMosaic, DMGPT, Runbook, and Avantra's READMEs all say where the site is live. JeremiahMercier, Ravenfrost, AndreRene, LucNathanael, Cadence, AtlantisTech, and Bizfront document the deploy mechanism in detail but never once state the URL the result of that mechanism can actually be reached at.",
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
          Asked where a project's public URLs should be documented, the honest answer required
          actually checking - and about half of this workspace's projects don't say. The four
          personal sites' <code>README.md</code> "Deployment" sections describe the myasp.net
          pipeline, the repository variables, and the secret it needs in real detail, but never
          once state <code>jeremiahmercier.com</code>, <code>ravenfrost.com</code>, or either of
          the other two domains. Cadence's "Production configuration and notifications" section
          covers connection strings, VAPID keys, and push credentials at length without ever
          stating <code>meetcaden.site</code> - it only shows up incidentally, in a privacy-policy
          link. AtlantisTech's README mentions its own domain exactly once, in the opening
          sentence, never under a deployment or production heading. Bizfront's three subdomains
          are named only descriptively, never framed as "this is where you go to see it running."
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Nothing ever said a README has to state where the project is live - only that it should
          document how to deploy it. Those turned out to be different habits: describing a
          pipeline is a natural thing to write while building the pipeline, but writing down the
          URL that pipeline produces is an easy afterthought once the site is already live and
          nobody's looking at the README again. The projects that do state it - MedServ, ModelMosaic,
          DMGPT, Runbook, Avantra - all happen to have needed the URL for something else in the
          README (a health-check path, a webhook target, a privacy-policy link) and stated it as
          part of that, not because "state the URL" was ever a rule on its own.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Every project's README states its own public URL somewhere obvious - a "Deployment" or
          "Production" heading is the natural place, next to the deploy mechanism it already
          documents. One line is enough: what it's called and where it's live, the same way
          MedServ, ModelMosaic, DMGPT, Runbook, and Avantra already do it.
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
        <p className="note">Already correct, for reference:</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: "MedServ/README.md",
              language: 'markdown',
              code: `## Production demonstration

- Public site: [https://advancedmedserv.cc/](https://advancedmedserv.cc/)`,
            }}
          />
          <CodeBlock
            example={{
              label: 'ModelMosaic/README.md',
              language: 'markdown',
              code: `## Deployment

Production: <https://modelmosaic.cc/>`,
            }}
          />
          <CodeBlock
            example={{
              label: 'DMGPT/README.md',
              language: 'markdown',
              code: `## Deployment

Live at [https://dmgpt.cc/](https://dmgpt.cc/), hosted on myasp.net.`,
            }}
          />
        </div>
        <p className="note">
          Not yet fixed - the "Deployment" section exists but the URL doesn't, or the URL exists
          but not under a deployment/production heading: JeremiahMercier, Ravenfrost, AndreRene,
          LucNathanael, Cadence, AtlantisTech, and Bizfront.
        </p>
      </section>
    </article>
  )
}
