import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'favicon-header-logo',
  title: 'Design one icon mark, then derive the favicon from it - simplified, unique, transparent',
  category: 'Frontend',
  summary:
    "MedServ's tab icon is still Vite's scaffolded default while its header shows the real client logo - and every other site's favicon so far uses a solid-color circle or rounded-rect background instead of a mark that stands on its own.",
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
          Two separate things show up under this same heading. First, a tab icon that has nothing
          to do with the app: MedServ's <code>favicon.svg</code> is still the purple gradient mark
          Vite scaffolds into every new project, while <code>App.tsx</code>'s header renders{' '}
          <code>/ams-logo.png</code>, Advanced Medical Services' real logo. Second, a subtler
          drift: every favicon in the workspace so far - Waymark's own included - is a small mark
          sitting on a filled circle or rounded-rect background (a colored disc, a dark rounded
          square). It looks fine, but it's a badge shape, not a mark that was designed to work on
          its own, and it's the same crutch on every site regardless of what the mark actually is.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Scaffolding a new Vite project drops a generic <code>favicon.svg</code> into{' '}
          <code>public/</code>. Most projects redraw it once into a brand mark and move on; when a
          project instead gets a real logo from somewhere else (a client-provided PNG, as in
          MedServ) for the header, nothing prompts revisiting the favicon, so the scaffold default
          survives untouched.
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
          have to be a byte-identical asset, just recognizably the same mark.
        </p>
        <p className="note">
          No favicon in the workspace meets the transparent-background bar yet - this is the
          standard for new sites going forward, not a retroactive fix applied to existing ones.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Waymark's own favicon today - a mark that leans on a background fill.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Web/public/favicon.svg - current',
              language: 'xml',
              code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <circle cx="32" cy="32" r="30" fill="#b8410f" />
  <path d="M19 39 L32 23 L45 39" fill="none" stroke="#f7f1e3" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Same idea, transparent background instead',
              language: 'xml',
              code: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
  <path d="M19 39 L32 23 L45 39" fill="none" stroke="#b8410f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round" />
</svg>`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
