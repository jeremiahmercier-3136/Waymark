import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'favicon-header-logo',
  title: 'Give a project a real favicon, and reuse it as the header logo',
  category: 'Frontend',
  summary:
    "MedServ's browser tab still shows Vite's scaffolded default icon while its header shows the real client logo - two unrelated marks for one app, because only one of them ever got replaced.",
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
          A project's browser tab shows a generic icon that has nothing to do with the app, while
          the header right below it shows a real, on-brand logo. In MedServ,{' '}
          <code>MedServ.Web/public/favicon.svg</code> is still the purple gradient mark Vite
          scaffolds into every new project, but <code>App.tsx</code>'s header renders{' '}
          <code>/ams-logo.png</code>, Advanced Medical Services' actual logo. The tab icon and the
          on-screen logo are two different images for the same app.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Scaffolding a new Vite project drops a generic <code>favicon.svg</code> into{' '}
          <code>public/</code>. In most projects that file gets redrawn into a small brand mark
          once, and both <code>index.html</code>'s <code>&lt;link rel="icon"&gt;</code> and the
          header's logo <code>&lt;img&gt;</code> point at that same file - one asset, two places it
          renders. When a project instead gets a real logo from somewhere else (a client-provided
          PNG, as in MedServ) for the header, nothing prompts revisiting the favicon: it's a
          separate file, in a separate place, and the app still looks right everywhere except the
          tab.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Keep the favicon and the header logo the same asset. Draw the brand mark once into{' '}
          <code>public/favicon.svg</code>, reference it from <code>index.html</code>'s icon link,
          and render that same file in the header with an <code>&lt;img&gt;</code> tag - this is
          the pattern in Avantra, ModelMosaic, and Runbook. There is then exactly one file to
          update if the brand mark ever changes, and no way for the tab icon to drift from what's
          on screen.
        </p>
        <p>
          When the header has to show a different, already-existing logo asset instead (a
          client's own logo file, not something drawn for this app), regenerate{' '}
          <code>favicon.svg</code> from that same asset rather than leaving the framework default
          in place - the goal is that the tab icon and the header always show the same mark, not
          that they're always literally the same file.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Avantra's pattern - one file, referenced from both places.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'index.html',
              language: 'html',
              code: `<link rel="icon" type="image/svg+xml" href="/favicon.svg" />`,
            }}
          />
          <CodeBlock
            example={{
              label: 'App.tsx - header logo',
              language: 'tsx',
              code: `<a className="brand" href="/" aria-label="Avantra home">
  <img className="brand-icon" src="/favicon.svg" alt="" />
  <span>AVANTRA</span>
</a>`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
