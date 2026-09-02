# Waymark Project Instructions

- Use React with TypeScript and Vite for the web application.
- Use C# and ASP.NET Core (minimal APIs) for the API.
- Keep persistence out of the project until a real need for it shows up; the marker catalog can live
  in code as seed data until its size or editing workflow requires a database.
- Never invent a marker's origin, symptom, or resolution. If content is illustrative rather than a
  real solved problem, label it clearly as an example instead of implying false history.
- Keep implementation steps narrow and independently testable.
- Run relevant builds and tests after every change.
- Do not add unnecessary abstractions or infrastructure.
- Match existing patterns, structure, and conventions rather than introducing inconsistent new
  ones; refactor or reorganize existing code when a change no longer fits it cleanly instead of
  bolting on. Optimize for the codebase staying coherent, not just for the immediate change working.
- Follow standard conventions for whichever language/framework a change is in.
- After finishing a change, review your own diff for completeness, correctness, and design quality
  as if reviewing someone else's PR, and act on what that review finds before considering it done.
