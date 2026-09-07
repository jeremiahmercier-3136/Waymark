import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'issues-doc-red-green',
  title: 'A live-testing issues doc, with a red test required before every fix',
  category: 'Testing',
  summary:
    "Three sibling projects already log live/production-testing findings in a docs/issues.md and resolve them inline, but none ever required a test proving the issue before fixing it - the same gap tdd-after-poc named for reported bugs generally, just never connected to this specific doc.",
  tags: ['testing', 'tdd', 'process', 'issues-doc'],
  isIllustrative: false,
}

export default function IssuesDocRedGreenPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A pass of live, manual testing against a real running app - not the automated test suite -
          turns up several distinct problems in one sitting. Without a fixed place to capture them,
          each gets chased and "fixed" in whatever order it was noticed, verified only by re-testing
          by hand, with nothing written down proving what was actually wrong or that the fix
          addresses it. A later regression has no record to check against, and nothing stops the same
          issue from coming back silently.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Avantra, Cadence, and ModelMosaic each already carry an identical <code>docs/issues.md</code>:
          list the issues found after a testing pass, resolve each one, write the resolution inline
          right after it, verify & test, commit & push, confirm the deploy. Avantra's actual log
          entries show that discipline paying off - each one traces a symptom to a specific, confirmed
          root cause backed by real evidence (a live CDP endpoint read, a screenshot of the actual
          virtual display, <code>docker stats</code> during a real incident) rather than a guess.
        </p>
        <p>
          But none of the three ever required a test proving the specific issue before touching code,
          or proving the fix after. Avantra's resolutions were verified by rebuilding the real image
          and re-inspecting it by hand each time - real verification, but not a test that keeps
          proving it. That's the exact gap <code>tdd-after-poc</code> already named for reported bugs
          in general; it had just never been connected to this specific doc, which is where this
          workspace's live-testing findings actually land.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Keep the same <code>docs/issues.md</code> convention, with <code>tdd-after-poc</code>'s rule
          folded directly into it: before changing anything for a listed issue, write a test that
          reproduces it and confirm it fails for the right reason (red) - never the other way around.
          Writing the fix first and adding a test afterward proves nothing, since a test written
          against already-fixed code can't demonstrate it would have caught the actual bug. Only once
          red is confirmed does the fix get implemented, then that exact same test runs again to
          confirm it now passes (green).
        </p>
        <p>
          Issues are resolved one at a time, not as a single batch at the end - they can be tackled
          out of order, and combined or split into phases where that makes sense, but each individual
          fix gets its own commit and push, verified, tested, and deployed before starting the next.
          That keeps a bad fix isolated to one deploy instead of bundled with several others, and
          means the doc's resolutions land in the same order the fixes actually shipped.
        </p>
        <p>
          The resolution written inline documents red-then-green explicitly, not just "fixed" - the
          proof that a fix addresses what was reported is the specific reproducing test, not a
          description of what changed. The documented resolution for a given issue is committed in
          that same fix's commit, matching the original convention's "verify & test the changes,
          commit & push."
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          The first block is the real, existing convention, unchanged across Avantra, Cadence, and
          ModelMosaic. The second is Waymark's own <code>docs/issues.md</code>, added with the
          red/green requirement folded in from the start.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Avantra / Cadence / ModelMosaic - docs/issues.md (existing convention)',
              language: 'markdown',
              code: `The following issues were identified after testing in production. Resolve each of the issues, document the resolution inline after each issue, verify & test the changes, commit & push, & verify the deployment succeeds. Include the documented resolutions in this file when you commit the changes.`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark - docs/issues.md',
              language: 'markdown',
              code: `The following issues were identified after testing in production. Resolve them one at a time, not
all at once - they may be worked out of order, and combined or split into phases as appropriate, but
each fix is its own commit & push, verified & tested and deployed individually before moving to the
next.

For each issue: before making any change, write a test that reproduces it and confirm the test fails
(red) for the right reason - never write or fix code first and add the test after the fact. Only once
red is confirmed, resolve the issue; then run that same test again and confirm it passes (green).
Document the resolution inline after each issue, including confirmation that the reproducing test
went red before the fix and green after, verify & test the changes, commit & push, & verify the
deployment succeeds. Include the documented resolution in this file in that same commit.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
