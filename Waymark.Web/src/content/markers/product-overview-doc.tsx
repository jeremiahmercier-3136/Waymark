import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'product-overview-doc',
  title: "A docs/product-overview.md: what the product is, for someone with zero context",
  category: 'Process',
  summary:
    "Asking for a plain-language product overview from scratch each time drifts into either a marketing page or a requirements spec; a fixed prompt template keeps it descriptive and honest about what's built vs. planned.",
  tags: ['documentation', 'process', 'onboarding'],
  isIllustrative: false,
}

export default function ProductOverviewDocPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A new contributor, stakeholder, or AI assistant opening a project has no single place to
          read what the product actually <em>is</em> before touching code - just a README (setup and
          commands) and whatever specs or issue trackers exist. Asking for a product overview
          without a fixed shape tends to land on one of two failure modes: marketing copy ("robust,
          reliable, seamless") that says nothing concrete, or a requirements/spec list that reads
          like a backlog instead of an explanation.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          There was no reusable template for this doc, so each project re-derived its structure and
          tone from scratch - and without an explicit instruction to separate "built today" from
          "planned," the two blur together, leaving a reader unable to tell what they can actually
          rely on right now.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Use a fixed prompt to generate <code>docs/product-overview.md</code>: a plain-prose
          walkthrough of what the product is, who it's for, and how the primary flow works end to
          end, told with a concrete example rather than an abstract feature list. Domain vocabulary
          that's ambiguous or diverges from what's actually in the UI/code gets defined explicitly.
          API or architecture details are allowed, but only where they shape what the user
          experiences or what makes the system trustworthy - not as implementation documentation.
        </p>
        <p>
          Two sections do the most work keeping the doc honest: a current-scope section that lists
          today's real limitations and gaps (verified against the actual codebase, not assumed), and
          a roadmap section framed by user benefit rather than internal task names. Bullets are fine
          for parallel lists, but the doc stays descriptive throughout - what the product is and
          does, not what it must do - so it never collapses into a requirements list.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          The reusable prompt, and DMGPT's <code>docs/product-overview.md</code> as the doc it
          produced.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Prompt to generate docs/product-overview.md',
              language: 'markdown',
              code: `Write docs/product-overview.md: a plain-prose overview of this product for someone with zero
context (new contributor, stakeholder, or AI assistant) who needs to understand what it *is* before
touching code.

Structure, adapted to fit the product:
- What it is - a short framing of the product and its core loop. If domain vocabulary is ambiguous
  or diverges from what's in the actual UI/code, define it explicitly.
- Who it's for - a few user scenarios, framed by what they want, not demographics.
- How it works - a walkthrough of the primary end-to-end flow, written as narrative with a concrete
  example, not a feature list. Note *why* behind deliberate design choices, not just *what*. Bring
  in API or architecture details only where they shape what the user experiences or what makes the
  system trustworthy - not as documentation of the implementation.
- Boundaries/guarantees (if relevant) - anything the system deliberately does or doesn't do that
  matters for trust, fairness, or safety.
- Current scope - an honest, specific account of today's limitations and gaps. This is what keeps
  the doc from reading like marketing.
- Where this is headed - near-term planned work, framed by user benefit.

Skip or reshape sections that don't fit. Stay descriptive throughout - this explains what the
product is and does, not what it must do; avoid anything that reads as a requirements or spec list,
even where bullets are used for clarity. No code. Be concrete over promotional. Keep "built today"
and "planned" clearly separated - verify against the actual codebase rather than assuming. Aim for
concise: cover the ground, don't pad it.`,
            }}
          />
          <CodeBlock
            example={{
              label: 'DMGPT/docs/product-overview.md (excerpt - the doc this prompt produced)',
              language: 'markdown',
              code: `## What it is

DMGPT lets a group of friends play a real Dungeons & Dragons 5th edition campaign without needing a
human Dungeon Master. [...] an AI plays the DM - narrating the world, voicing NPCs, adjudicating
actions, and reacting to whatever the party does, in real time, in a shared chat.

A quick note on terms this document uses: a campaign is the persistent game [...] A session is one
sitting at the table. [...] (The app's UI currently labels a campaign a "game" - the concept is the
same one described here as a campaign.)

## Current scope

The ruleset is fixed to D&D 2014 5th edition for now [...] there's no self-service password reset
yet - losing your password means losing the account.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
