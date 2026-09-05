import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'naming-conventions',
  title: 'A project folder and its GitHub repo should be PascalCase, not the lowercase domain',
  category: 'Process',
  summary:
    "Four new personal-site projects were scaffolded as jeremiahmercier, ravenfrost, andrerene, and lucnathanael - the lowercase domain name - instead of matching every other project's PascalCase folder and repo name.",
  tags: ['process', 'scaffolding', 'github'],
  isIllustrative: false,
}

export default function NamingConventionsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Four new personal-site projects - JeremiahMercier, Ravenfrost, AndreRene, and
          LucNathanael - had lowercase local folders (<code>jeremiahmercier</code>,{' '}
          <code>ravenfrost</code>, <code>andrerene</code>, <code>lucnathanael</code>) and lowercase
          GitHub repos to match, even though every other project on disk and on GitHub
          (AtlantisTech, Avantra, Bizfront, Cadence, MedServ, ModelMosaic, Runbook, Virtual911,
          Waymark) uses PascalCase for both. The inconsistency was easy to miss because everything
          <em> inside</em> each repo was already correctly cased -{' '}
          <code>Ravenfrost.Api</code>, <code>Ravenfrost.Web</code>, <code>Ravenfrost.slnx</code> -
          only the folder and repo wrapping them were wrong.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Each of these is a personal site with a lowercase domain (<code>ravenfrost.com</code>).
          When scaffolding, the domain name got reused directly as the folder and repo name instead
          of being treated as a separate, intentionally-lowercase identifier. Nothing in the
          scaffolding step cross-checked the new folder/repo name against the PascalCase convention
          every prior project already followed.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Project folder names and GitHub repo names are PascalCase, matching the solution name
          (the same string used for the <code>.slnx</code> file and the <code>.Api</code>/
          <code>.Web</code> project prefixes) - regardless of what the project's domain looks like.
          Two things are conventionally lowercase/kebab-case and should stay that way: the domain
          itself, and any npm <code>package.json</code> <code>"name"</code> field. Nothing else
          should follow the domain's casing.
        </p>
        <p>
          Fixing an already-mis-cased repo takes three steps: rename the GitHub repo (a redirect
          from the old name is kept automatically), rename the local folder - on a case-insensitive
          filesystem this needs a two-step move through a temporary name, a same-casing rename is a
          no-op - and point the local <code>origin</code> remote at the new URL rather than relying
          on the redirect indefinitely.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">The fix applied to all four projects.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Rename the GitHub repo',
              language: 'bash',
              code: `gh repo rename Ravenfrost --repo jeremiahmercier-3136/ravenfrost --yes`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Rename the local folder (case-insensitive filesystem)',
              language: 'bash',
              code: `mv ravenfrost __tmp_ravenfrost && mv __tmp_ravenfrost Ravenfrost`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Point origin at the renamed repo',
              language: 'bash',
              code: `git remote set-url origin https://github.com/jeremiahmercier-3136/Ravenfrost.git`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
