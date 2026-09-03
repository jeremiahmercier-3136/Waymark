import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'tdd-after-poc',
  title: 'Red-green TDD once the POC works',
  category: 'Process',
  summary:
    "Fixing a reported bug or behavior change without a test proving it first means nothing stops the same bug from coming back silently, and nothing proves the fix actually addresses what was reported.",
  tags: ['tdd', 'testing', 'process', 'agents-md'],
  isIllustrative: false,
}

export default function TddAfterPocPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A bug gets "fixed" by changing code until the reported symptom seems to go away, with
          nothing added that actually proves it - so a later change can silently reintroduce the
          same bug, and there's no record of what "fixed" originally meant.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Only one of this workspace's projects (Avantra) had ever written this down as a rule.
          Everywhere else, whether to write a failing test first was left to whoever was making the
          change, for that change only.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Not for the initial proof of concept - that phase is still about finding the shape of the
          thing. Once it works, every reported bug or requested behavior change starts with a test
          that captures the desired behavior and fails, then code until it passes. And when a
          change breaks an existing test, that's a question to answer, not a reflex to clear:
          figure out whether the test or the new behavior is wrong - possibly both - before
          touching either.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Added to this project's own AGENTS.md, carried over from Avantra's - see{' '}
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
              code: `- Once a feature's initial version (a proof of concept) is working, switch to red-green TDD for
  further changes: for every reported bug or requested behavior change, first write a test that
  captures the desired behavior and fails, then implement until it passes. Tests must exercise the
  actual behavior in question, not trivial assertions.
- If a change breaks an existing test, don't reflexively revert the change or reflexively edit the
  test to match it - evaluate both the test and the new behavior against what's actually correct,
  and fix whichever one (or both) is wrong.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
