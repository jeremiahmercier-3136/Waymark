import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import { Link } from 'react-router-dom'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'consistent-theme',
  title: 'Define the theme once, as tokens and shared components, and build every page from it',
  category: 'Frontend',
  summary:
    "Buttons and inputs that look different from one page to the next, a navigation menu redesigned from scratch each time, and text barely distinguishable from its background all trace back to the same thing: no single defined theme every page is required to build from.",
  tags: ['frontend', 'design-system', 'agents-md', 'accessibility'],
  isIllustrative: false,
}

export default function ConsistentThemePage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          The same kind of element looks different depending on which page or feature it was built
          in - a button with one radius and weight here, a slightly different one there; a text
          input styled fine in one form and unstyled or oddly bordered in another. Navigation -
          especially a hamburger menu or a profile-avatar menu - gets redesigned from scratch on
          every pass instead of converging, sometimes landing on a long flat list of buttons that
          don't obviously belong together. Occasionally body text ends up close enough in color to
          its background to be genuinely hard to read.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          There's no single place a color, spacing value, or component style is defined once and
          required to be reused - each button, input, or menu is styled locally where it's built, so
          nothing keeps two instances of the "same" element consistent with each other, and a color
          pairing picked ad hoc for one page is never checked against a contrast standard, because
          there's no shared token it would have been checked against in the first place. Navigation
          fares worse than most UI because it's rebuilt least often and has no established local
          precedent to copy from, so it tends to get redesigned from first principles - and without
          a stated interaction convention to converge on, "from first principles" produces a
          different answer each time.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Define the theme in exactly one place: a small set of tokens (background, surface, text,
          and one or two accent colors; a spacing scale; a type scale; radius and shadow values -
          CSS custom properties work, and Waymark's own <code>index.css</code> already does this)
          and a small set of shared components built from those tokens (button, text input, nav).
          Every page and feature builds from those primitives. When a new UI need comes up, check
          whether an existing shared component covers it before styling something locally; if it
          doesn't fit, extend or refactor that shared component so every user of it benefits, rather
          than growing a parallel one-off version styled just for the new spot - the same reuse
          discipline as <Link to="/markers/reuse-first">reuse-first</Link>, applied to styling
          specifically.
        </p>
        <p>
          Two things are worth naming directly instead of leaving to "use good judgment": navigation
          stays to a small number of clearly labeled, grouped top-level destinations, not a flat list
          of every available action, and follows the interaction pattern users already know - a
          profile avatar opens a dropdown for account-level actions, a hamburger collapses that same
          primary navigation on narrow screens, rather than a new interaction invented per project.
          And every text/background color pairing gets checked against a real contrast minimum (WCAG
          AA: 4.5:1 for body text, 3:1 for large text) using the theme's defined tokens before it
          ships - never eyeballed, and never a new ad hoc color introduced just to make one page look
          slightly different.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Added to this project's own AGENTS.md.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AGENTS.md',
              language: 'markdown',
              code: `- Define the app's visual language once, as tokens (color, type scale, spacing, radius) and shared
  components (button, input, nav) built from them, and build every page from those primitives -
  never redefine a button, input, or one-off color locally per page or feature.
- Navigation - menus, hamburgers, avatar dropdowns - follows the interaction pattern users already
  expect: a small number of clearly labeled, grouped top-level destinations, an avatar menu for
  account actions, a hamburger that collapses the same primary nav on narrow screens. Not a flat
  list of every available action, and not a new interaction model per project.
- Check every text/background color pairing against the theme's defined tokens for real contrast
  (WCAG AA - 4.5:1 for body text, 3:1 for large text) before shipping it - never eyeball it.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
