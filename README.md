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

The catalog holds real markers only, drawn from actual decisions and practice in this workspace.
The illustrative placeholders the project shipped with were removed once real markers existed to
demonstrate the format instead. A marker's `isIllustrative` flag still exists for any future
placeholder, and the web UI labels illustrative ones accordingly, but nothing in the catalog right
now is illustrative.

## Project layout

- `Waymark.Web` - React, TypeScript, and Vite UI. Each marker is a real page component under
  [`Waymark.Web/src/content/markers`](Waymark.Web/src/content/markers) - open the file to read the
  marker, there's no database or CMS layer in between.
- `Waymark.Api` - ASP.NET Core host. It serves `/api/health` and the built web app; it doesn't serve
  marker content.
- `Waymark.Api.Tests` - API tests.

## Markers

Each marker is its own page, both to browse and in source:

- `/markers/{id}` in the web app renders that marker's page - symptoms, root cause, resolution, and,
  where appropriate, labeled code examples (e.g. "Problem" / "Fix") for both reading and the actual
  implementation.
- The same page's source lives at
  `Waymark.Web/src/content/markers/{id}.tsx` - the file *is* the marker, not a template plus a
  data record. [`Waymark.Web/src/content/markers/registry.ts`](Waymark.Web/src/content/markers/registry.ts)
  lists every marker file so the catalog and router can find them.

There's intentionally no marker API. The catalog is a static site once built - fetching a marker's
own content back from a server it's already bundled into would just be a second copy to keep in
sync.

## Local setup

Prerequisites: .NET 10 SDK and Node.js 22+.

```powershell
npm run restore
npm run dev
```

The web app runs on `http://localhost:5179`. The API runs on `http://localhost:5119`, with health at
`/api/health`. Requests to `/api` from Vite are proxied to the API.

Useful commands:

```powershell
npm run build
npm run lint
npm run test
```

## Adding a marker

1. Create `Waymark.Web/src/content/markers/{id}.tsx`, where `{id}` is short - a couple of words,
   not a full sentence of hyphens - since it's also the URL and the filename someone has to type.
   Export a `meta: MarkerMeta` object (`id`, `title`, `category`, `summary`, `tags`,
   `isIllustrative`) and a default-exported page component that renders the marker with
   `<MarkerPageHeader meta={meta} />` plus `Symptoms` / `Root cause` / `Resolution` sections, and a
   `Code` section (using `<CodeBlock>`) where a snippet - for reading and/or the actual
   implementation - makes it clearer. Look at
   [`tech-stack.tsx`](Waymark.Web/src/content/markers/tech-stack.tsx) for an example.
2. Register the new file in
   [`registry.ts`](Waymark.Web/src/content/markers/registry.ts) so the catalog and `/markers/{id}`
   route pick it up.

Only add a marker for a problem that actually took real time to diagnose (or a decision that
actually got made) and is likely to come up again - not a one-off typo. Set `isIllustrative: true`
only for placeholder entries that demonstrate the format rather than recording something that
actually happened - never for a real marker, and never leave it unset for an illustrative one. This
is what keeps illustrative content from being mistaken for real project history in the web UI's
"Illustrative" badge.

## Production diagnostics

The host gives no console, RDP, or FTP access, so Waymark exposes structured logs through a
certificate-authorized `GET /api/operations/logs/{date}`. See the
[`prod-troubleshooting`](Waymark.Web/src/content/markers/prod-troubleshooting.tsx) marker for the
full pattern. To retrieve logs, an operator or agent with the private key installed runs:

```powershell
./scripts/Get-ProductionLogs.ps1 -BaseUrl 'https://<site>.site4now.net' -Date 2026-09-03
```

## License

[MIT](LICENSE)
