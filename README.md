# Waymark

Waymark is a field guide to problems already solved. Every project runs into the same handful of
problems in a slightly different disguise: a flaky deploy step, a framework edge case, a build tool
that breaks quietly on upgrade. Waymark is where those problems get written down once - the symptom,
the root cause, and the fix - so the next project (or this one, months later) starts from the answer
instead of rediscovering it.

## Why this exists

Solving the same problem twice, in two different projects, months apart, is a waste of the time it
took to solve it the first time. Waymark exists to make that lookup cheap: search a short, honest
description of what went wrong before diagnosing it from scratch again.

Each entry - a **marker** - records:

- **Symptoms** - what it actually looked like when it happened.
- **Root cause** - why it happened, not just what fixed it.
- **Resolution** - the specific change that resolved it.

## Current state

The catalog currently holds a small set of **placeholder markers**. They illustrate the format a
real entry should follow; they are not drawn from any specific project's history. Real markers get
added here as they're found. See [`docs/build-plan.md`](docs/build-plan.md) for what's next.

## Project layout

- `Waymark.Web` - React, TypeScript, and Vite reference UI.
- `Waymark.Api` - ASP.NET Core API serving the marker catalog and the built web app.
- `Waymark.Api.Tests` - API and store tests.

## Local setup

Prerequisites: .NET 10 SDK and Node.js 22+.

```powershell
npm run restore
npm run dev
```

The web app runs on `http://localhost:5178`. The API runs on `http://localhost:5119`, with health at
`/api/health`. Requests to `/api` from Vite are proxied to the API.

Useful commands:

```powershell
npm run build
npm run lint
npm run test
```

## Adding a marker

Add an entry to the seed list in [`Waymark.Api/MarkerStore.cs`](Waymark.Api/MarkerStore.cs) with a
unique `id`, the affected `category`, a one-line `summary`, and honest `symptoms` / `rootCause` /
`resolution` text. Only add a marker for a problem that actually took real time to diagnose and is
likely to come up again - not a one-off typo.

## License

[MIT](LICENSE)
