import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'favicon-header-logo',
  title: 'Design one icon mark, then derive the favicon from it - simplified, unique, transparent',
  category: 'Frontend',
  summary:
    "A favicon left at the framework-scaffolded default, missing entirely, or built as a mark sitting on a filled circle/rounded-rect background all read as unfinished - the background fill especially, since it's a badge shape standing in for a mark that isn't yet simple or high-contrast enough to stand on its own.",
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
          A site's favicon is still the framework-scaffolded default (Vite's purple gradient mark,
          or ASP.NET Core's stock template icon) even though the header already carries a real
          logo, or there's no favicon at all - a broken link to a file that isn't there, or none
          ever added. Most commonly, the favicon is a real mark, but sitting on a filled circle or
          rounded-rect background: it looks fine, but it's a badge shape standing in for a mark
          that isn't designed to work on its own.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Scaffolding a new project drops a generic favicon into place. When a project gets a real
          logo from somewhere else (a client-provided asset, say) for the header, nothing prompts
          revisiting the favicon, so the scaffold default survives untouched - or, if the link in{' '}
          <code>index.html</code> is never fixed to match, survives pointing at a file that isn't
          there anymore.
        </p>
        <p>
          The background-fill habit has a simpler cause: a solid rect or circle behind the mark is
          the easy way to guarantee contrast and a consistent square footprint at any size, so it
          gets reused without asking whether the mark actually needs it - a shortcut around
          designing the mark's own shapes and contrast to carry the icon, not a deliberate brand
          choice.
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
          disappear or muddy at small sizes, thicken thin strokes, cut a gradient down to flat color
          if it stops reading. The favicon and the header logo share one identity and are often the
          same file when the mark is already simple enough, but the favicon is allowed to be a
          plainer derivative of a more detailed header logo - it doesn't have to be a byte-identical
          asset, just recognizably the same mark. When the header logo is a real asset that isn't a
          simplifiable icon at all (a wordmark, an illustration), leave it alone and derive the
          favicon from its colors and initial instead of inventing an unrelated icon.
        </p>
        <p>
          One thing the background fill was quietly doing: guaranteeing the mark showed up against
          any surface. Drop it, and the mark's own color has to carry that job instead - including
          on browser chrome the mark's own designer wasn't thinking about. A pale color tuned for a
          dark theme can nearly disappear on a light tab; check a new mark against a light tab and a
          dark one, not just the theme it was designed for.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Waymark's own favicon, before and after applying this pattern.</p>
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
          A multi-track site (separate framework, separate build per track) should still share one
          brand mark as the same <code>favicon.ico</code>/<code>favicon.svg</code> pair across every
          track, rather than each track guessing independently.
        </p>
      </section>
    </article>
  )
}
