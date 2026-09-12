import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'sliding-session-refresh',
  title: 'A sliding session, refreshed on real app-open - not a fixed expiry, not every foreground check',
  category: 'Security',
  summary:
    "\"How long should a signed-in session last?\" is really two different questions wearing one costume: how long can it survive between real visits, and how often should it actually be extended. Picking one fixed number for both either logs out an active user or never bounds a stale one.",
  tags: ['auth', 'sessions', 'jwt', 'ux'],
  isIllustrative: false,
}

export default function SlidingSessionRefreshPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A user who was signed in a day or two ago finds themselves signed out again, despite
          "remember me" being the whole point - or the opposite complaint, a session that seemingly
          never expires no matter how long a device sits untouched. Both come from the same
          unexamined assumption: that a session's expiry is one fixed duration set at login and
          never revisited.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          A token issued with <code>expires = now + N days</code> at login time is an{' '}
          <em>absolute</em> expiry - it counts down from the moment of login, not from the moment of
          last use. A user who opens the app every few days, forever, still gets logged out exactly{' '}
          <code>N</code> days after they first signed in, because nothing about their continued use
          ever moved that fixed line. Picking a bigger <code>N</code> to compensate just trades one
          failure mode for the other: an abandoned or stolen session now stays valid for months
          with no activity at all.
        </p>
        <p>
          The fix isn't a better number - it's recognizing that "how long can an inactive session
          survive" and "does using the app extend it" are two separate knobs, and the second one
          is what a user actually means by "keep me signed in."
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Give the token a moderate absolute TTL (two to four weeks is a reasonable default for a
          personal, non-financial app - long enough that a weekly user never notices it, short
          enough to bound a lost or stolen device's exposure) but re-issue it with a fresh expiry{' '}
          <strong>on every genuine app-open</strong> - not on every lightweight check. That
          distinction matters: a mobile app resumed from the background, or a browser tab regaining
          focus, isn't the same event as a user actually launching the app, and treating it as one
          makes the session effectively un-expirable as long as the process happens to stay alive.
        </p>
        <p>
          Concretely, that means two different client behaviors reading the same server endpoint
          split in two: a <code>POST /refresh</code> that rotates the token and its expiry, called
          once per real launch (cold start, or a page load with no prior in-memory session); and a
          lightweight <code>GET /me</code> for every subsequent foreground/focus check, which
          confirms the session is still valid without sliding it forward. Both platforms need to
          agree on which events count as "a real launch" for this to actually deliver on "keep me
          signed in as long as I use the app" - a native mobile client resuming from years in the
          background is functionally "opening the app" from the user's point of view even though
          the OS never killed the process, so foreground-resume there should slide the session too,
          not just a true cold process start.
        </p>
        <p className="note">
          This is a UX/security trade-off, not a solved-once constant - a banking app should use a
          much shorter absolute TTL and re-authenticate rather than silently slide; a personal
          coaching or notes app has little reason not to feel like "signed in until I explicitly
          sign out." Pick the TTL and refresh boundary deliberately for what the app actually holds,
          and write the reasoning down next to the code - the number alone won't explain itself to
          the next person reading it.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Server - refresh slides the expiry forward; /me does not',
              language: 'csharp',
              code: `// Called once per real app-open. Issues a new token/cookie with a fresh expiry.
app.MapPost("/api/auth/refresh", async (ClaimsPrincipal user, IdentityService identity) =>
{
    var result = await identity.RefreshAsync(user, now.AddDays(14));
    SetAuthCookie(response, result.Token, result.ExpiresAtUtc);
    return Results.Ok(result.Account);
});

// Called on every foreground/focus check. Confirms validity; never rotates the expiry.
app.MapGet("/api/auth/me", (ClaimsPrincipal user) => Results.Ok(CurrentAccount(user)));`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Client - which event calls which endpoint is the whole design',
              language: 'typescript',
              code: `// Web: a page load is "opening the app" - slide the session.
useEffect(() => { void apiFetch('/api/auth/refresh', { method: 'POST' }) }, [])
// Tab regaining focus is not a fresh open - just confirm, don't slide.
window.addEventListener('focus', () => void apiFetch('/api/auth/me'))

// Mobile: cold start also slides...
async function restore() {
  const stored = await sessionStorage.load()
  if (!stored || Date.parse(stored.expiresAtUtc) <= Date.now()) return null
  return api.refresh() // slides
}
// ...and so does resuming from background, because on a phone that IS "opening the app"
// from the user's perspective even though the process never fully died.
AppState.addEventListener('change', state => {
  if (state === 'active') void api.refresh() // slides here too - not just a lightweight sync()
})`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
