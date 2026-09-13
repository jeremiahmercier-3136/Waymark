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
- Follow modern development standards and UI/UX conventions for whichever language, framework, and
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
  separate cleanup pass.
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
