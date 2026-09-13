import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'reuse-first',
  title: 'Reuse and consolidate before adding new code',
  category: 'Process',
  summary:
    "Writing new code for the problem directly in front of you is the fastest path in the moment, but it quietly duplicates what already exists and leaves two ways of doing the same thing where there should be one.",
  tags: ['process', 'agents-md', 'code-quality', 'refactoring'],
  isIllustrative: false,
}

export default function ReuseFirstPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A new problem gets solved by writing new code next to an existing near-equivalent instead
          of reusing or extending it, so the codebase ends up with two utilities that do almost the
          same thing, two components built independently for the same layout, or a newly-added bit
          of UI that ignores a convention the rest of the app already settled on. Each individual
          change looks reasonable on its own; the drift only shows up once someone - or some agent -
          has to work out which of two similar-looking things is actually the one to use.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Solving the problem right in front of you with new code doesn't require first finding and
          understanding what's already there; searching for an existing solution and deciding
          whether to reuse, extend, or refactor it takes more effort up front. Without an explicit
          instruction to search before writing and to consolidate when duplication turns up, that
          shortcut is the default outcome, not the exception - and it compounds, since today's copy
          becomes the pattern the next change copies from.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Before writing new code, look for a similar solution already in the codebase - a utility,
          a component, an existing pattern for the same kind of problem - and reuse or extend it
          rather than duplicate it; only add new code once reuse and refactoring the existing
          solution have been ruled out. When duplicate implementations of the same concern turn up -
          whether they already existed or the current change just introduced a second one -
          consolidate them into a single implementation and update every call site, rather than
          leaving both to diverge further.
        </p>
        <p>
          Across all of this, favor reducing or eliminating code over adding it: removing dead code,
          collapsing near-duplicates, and dropping abstractions that no longer earn their keep are
          part of the change itself, not a separate cleanup pass deferred to later. And hold the
          result to current standards rather than whatever's already nearby - modern, non-deprecated
          idioms for the language and framework in use (an easy default to miss, since training data
          can lag behind current convention), and UI that's accessible and responsive, built from the
          existing design system's components rather than a new one-off pattern per feature.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Added to this project's own AGENTS.md - the first project in this workspace to write it
          down. See{' '}
          <a href="https://github.com/jeremiahmercier-3136/Waymark/blob/main/AGENTS.md">
            AGENTS.md
          </a>
          .
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AGENTS.md',
              language: 'markdown',
              code: `- Follow modern development standards and UI/UX conventions for whichever language, framework, and
  design system a change is in - don't default to outdated idioms just because older code nearby
  still uses them.
- Before writing new code, look for a similar solution already in the codebase and reuse or extend
  it rather than duplicate it - only add new code once reuse and refactoring the existing solution
  have been ruled out.
- When duplicate implementations of the same concern turn up - pre-existing, or introduced by the
  current change - consolidate them into one and update every call site, rather than leaving both to
  diverge.
- Favor reducing or eliminating code over adding it: removing dead code, collapsing near-duplicates,
  and dropping abstractions that no longer earn their keep are part of the change itself, not a
  separate cleanup pass.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
