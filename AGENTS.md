# Waymark Project Instructions

- Use React with TypeScript and Vite for the web application.
- Use C# and ASP.NET Core (minimal APIs) for the API.
- Keep persistence out of the project until a real need for it shows up; each marker is a real page
  component under `Waymark.Web/src/content/markers`, not a database row rendered by a template -
  don't reintroduce a backend content store for it.
- Never invent a marker's origin, symptom, or resolution. If content is illustrative rather than a
  real solved problem, label it clearly as an example instead of implying false history.
- Keep implementation steps narrow and independently testable.
- Run relevant builds and tests after every change.
- Do not add unnecessary abstractions or infrastructure.
- Follow modern development standards for whichever language and framework a change is in - don't
  default to outdated idioms just because older code nearby still uses them.
- Before writing new code, look for a similar solution already in the codebase and reuse or extend
  it rather than duplicate it - only add new code once reuse and refactoring the existing solution
  have been ruled out.
- When duplicate implementations of the same concern turn up - pre-existing, or introduced by the
  current change - consolidate them into one and update every call site, rather than leaving both to
  diverge.
- Favor reducing or eliminating code over adding it: removing dead code, collapsing near-duplicates,
  and dropping abstractions that no longer earn their keep are part of the change itself, not a
  separate cleanup pass.
- Define the app's visual language once, as tokens (color, type scale, spacing, radius) and shared
  components (button, input, nav) built from them, and build every page from those primitives -
  never redefine a button, input, or one-off color locally per page or feature.
- Navigation - menus, hamburgers, avatar dropdowns - follows the interaction pattern users already
  expect: a small number of clearly labeled, grouped top-level destinations, an avatar menu for
  account actions, a hamburger that collapses the same primary nav on narrow screens. Not a flat
  list of every available action, and not a new interaction model per project.
- Check every text/background color pairing against the theme's defined tokens for real contrast
  (WCAG AA - 4.5:1 for body text, 3:1 for large text) before shipping it - never eyeball it.
- Once a feature's initial version (a proof of concept) is working, switch to red-green TDD for
  further changes: for every reported bug or requested behavior change, first write a test that
  captures the desired behavior and fails, then implement until it passes. Tests must exercise the
  actual behavior in question, not trivial assertions.
- If a change breaks an existing test, don't reflexively revert the change or reflexively edit the
  test to match it - evaluate both the test and the new behavior against what's actually correct,
  and fix whichever one (or both) is wrong.
- Match existing patterns, structure, and conventions rather than introducing inconsistent new
  ones; refactor or reorganize existing code when a change no longer fits it cleanly instead of
  bolting on. Optimize for the codebase staying coherent, not just for the immediate change working.
- Follow standard conventions for whichever language/framework a change is in.
- After finishing a change, review your own diff for completeness, correctness, and design quality
  as if reviewing someone else's PR, and act on what that review finds before considering it done.
