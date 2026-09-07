import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'waymark-reference',
  title: "Every project's AGENTS.md points back to Waymark",
  category: 'Process',
  summary:
    "A project with no standing reference to Waymark in its AGENTS.md gives an agent working there no way to know Waymark - or any marker already written for the problem at hand - exists.",
  tags: ['process', 'agents-md', 'waymark'],
  isIllustrative: false,
}

export default function WaymarkReferencePage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A problem gets diagnosed from scratch in one project even though Waymark already has a
          marker for the exact thing, because nothing in that project's <code>AGENTS.md</code> told
          the agent working there that Waymark exists.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          <code>AGENTS.md</code> is the first thing an agent reads at the start of a session -
          anything not stated there doesn't exist as far as that session is concerned, no matter how
          many prior sessions in other projects already solved the same problem and wrote it down.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Every project's <code>AGENTS.md</code> carries a standing bullet, worded the same way in
          each one, pointing back at Waymark: check it for an existing marker before solving a
          problem that feels familiar, and add a new one afterward for anything that took real time
          to diagnose or is a decision worth remembering. It goes first in the bullet list, right
          after the title, so it's read before anything project-specific rather than buried among
          it. A project with no <code>AGENTS.md</code> yet gets a minimal one created just to carry
          this line.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          The bullet every other project's <code>AGENTS.md</code> carries. Waymark itself is the
          thing being pointed to, so it doesn't carry a copy of its own bullet.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AGENTS.md - first bullet',
              language: 'markdown',
              code: `- Check Waymark (\`../Waymark\`, or https://waymark.cc/) for an existing marker before solving a
  problem that feels familiar - it's this workspace's shared field guide to problems already
  solved. Add a new marker there afterward for anything that took real time to diagnose or is a
  decision worth remembering, per its README's "Adding a marker" section.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
