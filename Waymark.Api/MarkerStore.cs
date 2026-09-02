namespace Waymark.Api;

/// <summary>
/// Seed content only. These markers illustrate the format a real, solved
/// problem should be recorded in - they are not drawn from any specific
/// project's history. Replace and extend with real markers over time.
/// </summary>
public sealed class MarkerStore
{
    private readonly List<Marker> _markers =
    [
        new(
            "vite-proxy-cold-start-404",
            "Vite dev proxy 404s on cold start",
            "Tooling",
            "The first request to /api after starting the dev server 404s because Vite's proxy starts before the API is listening.",
            "Opening the web app right after `npm run dev` shows a failed fetch or 404 for the first API call; reloading the page fixes it.",
            "Vite's dev server accepts connections before the proxied backend is ready, so the very first proxied request has nothing to reach.",
            "Gate the frontend start behind a TCP wait on the API's port (e.g. wait-on) instead of starting both processes at the same instant.",
            ["vite", "dev-server", "proxy"]),
        new(
            "webdeploy-silently-skips",
            "Web Deploy step silently skips with blank secrets",
            "Deployment",
            "A CI deploy step reports green but never deploys, because required secrets were never configured on a freshly created repo.",
            "The GitHub Actions run finishes successfully with no errors, but the site never updates.",
            "The workflow step conditionally skips the actual deploy when required secrets are empty or left as placeholder values, and that skip isn't loud enough to notice.",
            "Add an explicit warning step that fires whenever any deploy secret is missing or still a placeholder, so a silent no-op is visible in the run log.",
            ["ci", "github-actions", "deploy"]),
        new(
            "ef-core-migration-drift",
            "EF Core migration drifts after a rename",
            "Data",
            "Renaming a property or table without a migration leaves the model and the database silently out of sync.",
            "Queries throw a column-not-found error in an environment that wasn't rebuilt from scratch, even though local development works fine.",
            "A rename was made directly in C# without generating a migration, so only environments with a fresh database - not an incrementally migrated one - reflect the change.",
            "Treat every model rename as two steps: rename in code, then immediately generate and commit the migration in the same change, never as a follow-up.",
            ["ef-core", "migrations", "postgresql"]),
        new(
            "react-state-update-after-unmount",
            "React state update warning after unmount",
            "Frontend",
            "An async fetch resolves after its component has already unmounted and tries to set state, logging a warning and risking a memory leak.",
            "Console warning about updating state on an unmounted component, usually after navigating away quickly during a slow request.",
            "The fetch's `.then` callback has no way to know the component is gone by the time it runs.",
            "Track a cancellation flag (or AbortController) in the effect's cleanup function and check it before calling any state setter.",
            ["react", "effects", "async"]),
        new(
            "actions-cache-key-collision",
            "GitHub Actions cache key collides across branches",
            "CI/CD",
            "Two branches building the same lockfile hash share a cache entry, so a build on one branch can pick up artifacts affected by a different branch's failed run.",
            "A build fails intermittently in a way that isn't reproducible locally and isn't tied to any code change on that branch.",
            "The cache key was derived only from the lockfile hash, with no branch or workflow-run scoping, so unrelated branches share state.",
            "Scope the cache key to the branch (or a restore-keys fallback chain) instead of the lockfile hash alone.",
            ["github-actions", "caching"]),
        new(
            "cors-preflight-blocked-by-auth-middleware",
            "CORS preflight blocked by auth middleware order",
            "Auth",
            "Browser preflight OPTIONS requests get rejected with 401 because authentication middleware runs before CORS middleware.",
            "Every cross-origin POST fails in the browser with a CORS error, even though the same request works fine from a REST client.",
            "The OPTIONS preflight request carries no credentials, so if auth middleware runs first it rejects the request before CORS headers are ever added to the response.",
            "Register CORS middleware ahead of authentication/authorization in the pipeline so preflight requests are answered before any auth check runs.",
            ["cors", "middleware", "aspnet-core"]),
    ];

    public IReadOnlyList<Marker> List() => _markers;

    public Marker? Find(string id) =>
        _markers.FirstOrDefault(m => string.Equals(m.Id, id, StringComparison.OrdinalIgnoreCase));
}
