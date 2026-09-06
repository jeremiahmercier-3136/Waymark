import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'favicon-header-logo',
  title: 'Design one icon mark, then derive the favicon from it - simplified, unique, transparent',
  category: 'Frontend',
  summary:
    'An audit of every project turned up three patterns: a favicon that never got past the framework default (MedServ, Virtual911, and - found in a later pass - Bizfront\'s Main and Umbraco tracks), no favicon at all (AtlantisTech, DMGPT, and Bizfront\'s Orchard Core track), and - everywhere else - a real mark sitting on a filled circle or rounded-rect background instead of standing on its own.',
  tags: ['frontend', 'branding', 'favicon'],
  isIllustrative: false,
}

export default function FaviconHeaderLogoPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Three separate things showed up under this same heading when every project was checked
          against this bar. First, a tab icon with nothing to do with the app: MedServ's{' '}
          <code>favicon.svg</code> was still the purple gradient mark Vite scaffolds into every new
          project, while its header rendered <code>/ams-logo.png</code>, Advanced Medical Services'
          real logo - and Virtual911's CAD console had the identical untouched default, with no
          header mark at all. Second, no favicon in the first place: AtlantisTech had none, and its
          header's "mark" was a CSS clip-path triangle with a letter in it; DMGPT's{' '}
          <code>favicon.svg</code> was an empty file and <code>index.html</code> still pointed at a
          404ing <code>/vite.svg</code>. Third, and most widespread: every other favicon in the
          workspace - Waymark's own included - was a small mark sitting on a filled circle or
          rounded-rect background. It looked fine, but it was a badge shape, not a mark designed to
          work on its own, and it was the same crutch on every site regardless of what the mark
          actually was.
        </p>
        <p>
          Bizfront wasn't in the original sweep - it's a multi-project ASP.NET Core solution
          (<code>Main/</code>, <code>Umbraco/</code>, <code>OrchardCore/</code>), not a Vite app, so
          it didn't surface in the first pass looking for the Vite scaffold default. A later check
          found the same first-pattern bug by a different route: <code>Main/</code> and{' '}
          <code>Umbraco/</code>'s <code>favicon.ico</code> were byte-identical to the stock ASP.NET
          Core template icon (confirmed against a throwaway scaffold project's own untouched
          default), and <code>OrchardCore/</code> had no favicon file at all - the framework-default
          and no-favicon patterns showing up together in one project, the same way
          MedServ/Virtual911 and AtlantisTech/DMGPT showed up on the Vite side.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Scaffolding a new Vite project drops a generic <code>favicon.svg</code> into{' '}
          <code>public/</code>. Most projects redraw it once into a brand mark and move on; when a
          project instead gets a real logo from somewhere else (a client-provided PNG, as in
          MedServ) for the header, nothing prompts revisiting the favicon, so the scaffold default
          survives untouched - or, if the link in <code>index.html</code> is never fixed to match,
          survives pointing at a file that isn't even there anymore (DMGPT).
        </p>
        <p>
          The background-fill habit has a simpler cause: a solid rect or circle behind the mark is
          the easy way to guarantee contrast and a consistent square footprint at any size, so it
          got reused site to site without ever asking whether the mark needed it. It's a shortcut
          around designing the mark's own shapes and contrast to carry the icon, not a deliberate
          brand choice.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Design one icon-only mark per site - no wordmark, since text disappears at tab-icon size
          - and make it specific to that site rather than a shape that could belong to anything.
          Give it a transparent background: no colored circle or rounded-rect fill behind it. A
          background fill reads fine at header size but turns the favicon into a badge, and it's
          covering for a mark that isn't yet simple or high-contrast enough to stand on its own at
          16-32px. Bold shapes, few elements, and strong contrast within the mark itself get you
          legibility without needing a backing shape.
        </p>
        <p>
          Design the mark first at the size and detail level it'll have in the header - that's the
          "logo" - then derive the favicon from it by simplifying further: drop anything that would
          disappear or muddy at small sizes, thicken thin strokes, cut a gradient down to flat
          color if it stops reading. The favicon and the header logo share one identity and are
          usually the same file when the mark is already simple enough (as with Avantra's,
          ModelMosaic's, and Runbook's marks, each paired with separate header text), but the
          favicon is allowed to be a plainer derivative of a more detailed header logo - it doesn't
          have to be a byte-identical asset, just recognizably the same mark. When the header logo
          is a real asset that isn't a simplifiable icon at all (MedServ's AMS wordmark, DMGPT's
          avatar illustration), leave it alone and derive the favicon from its colors and initial
          instead of inventing an unrelated icon.
        </p>
        <p>
          One thing the background fill was quietly doing: guaranteeing the mark showed up against
          any surface. Drop it, and the mark's own color has to carry that job instead - including
          on browser chrome the mark's own designer wasn't thinking about. Ravenfrost's first pass
          used the pale ice-blue from its own dark theme, which nearly disappeared on a light or
          white tab; it needed a darker mid-tone before it read on both. Check a new mark against a
          light tab and a dark one, not just the theme it was designed for.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Waymark's own favicon, before and after this audit.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Web/public/favicon.svg - before',
              language: 'xml',
              code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#b8410f" />
  <path d="M19 39 L32 23 L45 39" fill="none" stroke="#f7f1e3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Web/public/favicon.svg - after',
              language: 'xml',
              code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M18 30 L32 16 L46 30" fill="none" stroke="#b8410f" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M32 22 V54" fill="none" stroke="#b8410f" stroke-width="6" stroke-linecap="round" />
  <circle cx="32" cy="54" r="4" fill="#b8410f" />
</svg>`,
            }}
          />
        </div>
        <p className="note">
          Every project's fix is in that project's own history: AtlantisTech, Avantra, Cadence,
          DMGPT, MedServ, ModelMosaic, Runbook, Virtual911, Waymark, and the four personal sites
          were all checked and, except Avantra, changed. Bizfront was checked in a later pass and
          changed too: one icon-only mark (an open doorway/archway - "storefront front door", tying
          the shape back to the product name) in a single accent color chosen for contrast on both
          light and dark tab chrome, shared as the same <code>favicon.ico</code>/
          <code>favicon.svg</code> pair across all three of its sites (<code>Main/</code>,{' '}
          <code>Umbraco/</code>, <code>OrchardCore/</code>) so the brand mark is one asset, not
          three independent guesses.
        </p>
      </section>
    </article>
  )
}
