# Waymark build plan

## Status at a glance

| Phase | Status | Current outcome |
| --- | --- | --- |
| 1. Reference shell | Complete | API health/marker endpoints, a static-content web UI explaining the project, and automated API coverage are implemented. |
| 2. Real markers | Not started | The catalog currently holds illustrative placeholder markers only; no real cross-project problem has been recorded yet. |
| 3. Search | Not started | Category filtering exists; free-text search across title/summary/tags does not. |
| 4. Persistence | Not started | Markers live in code as seed data. No database exists or is needed yet. |
| 5. Cross-project pull | Not started | No tooling exists yet for another repo to pull a relevant marker into its own docs or AGENTS.md. |

## Guiding constraints

- Keep one ASP.NET Core host serving both the REST API and the built web app, matching the other
  recent projects in this workspace.
- Keep the marker catalog in code (`Waymark.Api/MarkerStore.cs`) for as long as it stays small and
  edited by one person. Move to a database only when that stops being true.
- Never present a placeholder marker as if it were drawn from real project history. Illustrative
  content must say so.
- Build only what the current phase needs.

## Phase 1: Reference shell

### Objective

Stand up a working API and UI that explain what Waymark is for, backed by a small illustrative
marker catalog.

### Implementation

1. Define the `Marker` record: id, title, category, summary, symptoms, root cause, resolution, tags.
2. Seed `MarkerStore` with a handful of placeholder markers that demonstrate the format.
3. Expose `GET /api/health`, `GET /api/markers`, and `GET /api/markers/{id}`.
4. Build a single-page React UI: a hero explaining the project's purpose, a three-step "how it
   works" strip, and a filterable, expandable marker catalog.
5. Add API tests covering the store and the endpoints.

### Complete when

- The API serves the seeded markers and a 404 for unknown ids.
- The web UI explains the project's purpose without requiring the reader to already know what it is.
- `npm run build` and `npm run test` both pass.

## Phase 2: Real markers

### Objective

Replace illustrative placeholders with markers drawn from problems actually solved in other
projects in this workspace.

### Implementation

1. Decide the minimum bar for adding a marker (a problem that took real time to diagnose and is
   likely to recur, not a one-off typo).
2. Add real markers to `MarkerStore`, keeping the same schema.
3. Remove or clearly relabel the placeholder markers once enough real ones exist to stand on their
   own.

### Complete when

- At least a handful of markers reflect problems actually encountered, with resolutions that were
  actually applied.

## Phase 3: Search

### Objective

Let a marker be found by more than category alone once the catalog grows past what a single page of
cards can make skimmable.

### Implementation

1. Add free-text filtering across title, summary, and tags in the web UI.
2. Only add a server-side search endpoint if the catalog grows large enough that client-side
   filtering becomes noticeably slow.

## Phase 4: Persistence

Deferred until editing markers as code stops being convenient - for example, once contributions
come from more than one person, or the catalog is large enough that a rebuild-and-redeploy cycle per
edit is too slow.

## Phase 5: Cross-project pull

### Objective

Make it easy for another project in this workspace to reference a Waymark entry directly instead of
copy-pasting it - for example, a small CLI or script that fetches a marker by id and drops it into a
project's own docs.

Deferred until Phase 2 has produced enough real markers to make this worth building.
