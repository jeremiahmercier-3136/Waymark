# Product overview

## What it is

Waymark is a field guide to problems already solved. Every software project runs into the same
handful of problems in a slightly different disguise - a flaky deploy step, a framework edge case,
a build tool that breaks quietly on upgrade - and Waymark is where those problems get written down
once, so the next project (or this one, months later) starts from the answer instead of
rediscovering it from scratch.

The unit of content is a **marker**: a page recording one problem's symptoms (what it looked like),
root cause (why it happened), and resolution (the specific fix), sometimes with a labeled code
example. A marker documents a pattern and its fix, not a diary of the incident that prompted it -
it deliberately omits which project it happened in or when, unless that detail is itself part of
the fix.

There is no database or CMS behind any of this. Each marker is a real React page component, and the
component's source file *is* the marker - there's no template plus a data record sitting behind it.
Adding a marker means writing a `.tsx` file and registering it; browsing one means opening that same
file, whether in the built site or in source.

## Who it's for

Waymark is a personal reference project maintained by one person, for their own workspace - the
site's own footer says as much: "a starting point, not a finished catalog." Two audiences use it in
practice: the maintainer, checking whether a problem they're facing has already been solved in a
past project, and an AI coding assistant working in one of those other projects, pointed at Waymark
by that project's own agent instructions before it re-diagnoses something familiar.

## How it works

Opening the site lands on a single catalog page: a short framing of what Waymark is, a three-step
"Encounter / Record / Reuse" explainer, and a grid of marker cards (title, one-line summary, tags,
and a category badge). A row of category chips - Process, Security, Deployment, Testing, Frontend,
Data, Tooling, Operations, Architecture - filters the grid to one category at a time; there is no
text search or tag-based browsing, so category and the visible summary text are what a reader scans
to find something relevant.

Clicking a card opens that marker's own page at `/markers/{id}`: the symptom, root cause, and
resolution as prose, plus a code section where a snippet makes the fix concrete - for example,
showing a broken config next to the corrected one. A marker can carry an `isIllustrative` flag for a
placeholder that demonstrates the format rather than a real problem; the UI labels those with an
"Illustrative" badge so they're never mistaken for something that actually happened. Every marker in
the catalog today is real - the flag exists for future use, not because any current entry needs it.

Because the catalog is a static bundle built from these files, there's intentionally no API serving
marker content back to the page - it's already compiled in.

## Boundaries and guarantees

Waymark has no user accounts and no in-browser way to add or edit a marker; the only path to new
content is committing a new file to the repository. This is a deliberate boundary, not a gap - it
keeps every marker's history in git and rules out a whole class of problems (spam, moderation,
inconsistent quality) that a public contribution form would otherwise create.

Production diagnostics follow the same "no side door" principle: the API server itself has no
console, RDP, or FTP access, so structured request logs are retrieved instead through a
purpose-built endpoint gated by an RSA signature from a certificate held by an authorized operator.
An unauthorized or malformed request gets an ordinary 404, identical to a route that doesn't exist,
so the endpoint's existence isn't advertised to anyone probing the site.

## Current scope

The catalog holds 22 markers today, real ones only. The web app is a two-route React/Vite
single-page app (the catalog, and a marker's own page); the API is a thin ASP.NET Core host that
serves `/api/health`, the signed log-export endpoint, and the built static site - nothing else.
There's no search box, no tag-based filtering, and no way to sort or bookmark markers beyond the
category chips and the browser's own history. There's no application-level authentication anywhere
in the product, because nothing in it needs a signed-in user - reading markers is public, and adding
one happens through git, not the UI.

## Where this is headed

There's no separate roadmap document; the project's stated direction is simply to keep recording
real markers as problems worth remembering come up in practice, rather than to grow toward
predefined features. The one process document that does exist, `docs/issues.md`, isn't a feature
list - it describes how production-discovered bugs get fixed (write a failing test first, confirm
it's red, then fix and confirm green), not what capability comes next.
