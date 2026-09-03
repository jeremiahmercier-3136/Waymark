import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'self-review',
  title: 'Review your own diff like a PR review',
  category: 'Process',
  summary:
    'A change that "works" isn\'t the same as a change that fits the codebase - narrow, testable steps and a real self-review catch the gap between the two before anyone else has to.',
  tags: ['code-review', 'process', 'agents-md'],
  isIllustrative: false,
}

export default function SelfReviewPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A change compiles and does what was asked, but introduces an abstraction the codebase
          didn't need, drifts from how the rest of the project does the same kind of thing, or
          leaves something half-finished a step away - the sort of issue a second pair of eyes on a
          pull request would flag, except there wasn't one.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Only one project in this workspace (Avantra) had written down an actual standard for
          this; elsewhere it was left implicit, so whether a change got scrutinized before being
          called done depended on who was making it.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Keep implementation steps narrow and independently testable, so each one is small enough
          to actually reason about. Match existing patterns and conventions instead of introducing
          inconsistent new ones - refactor the surrounding code when a change no longer fits it
          cleanly, rather than bolting on next to it. Follow the standard conventions of whichever
          language or framework the change is in. Then, before calling anything done, read back the
          whole diff as if it were someone else's pull request - completeness, correctness, design
          - and act on what that review finds.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Already in this project's AGENTS.md - carried over from Avantra's during the initial
          scaffold, before this marker existed to say where it came from. See{' '}
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
              code: `- Keep implementation steps narrow and independently testable.
- Match existing patterns, structure, and conventions rather than introducing inconsistent new
  ones; refactor or reorganize existing code when a change no longer fits it cleanly instead of
  bolting on. Optimize for the codebase staying coherent, not just for the immediate change working.
- Follow standard conventions for whichever language/framework a change is in.
- After finishing a change, review your own diff for completeness, correctness, and design quality
  as if reviewing someone else's PR, and act on what that review finds before considering it done.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
