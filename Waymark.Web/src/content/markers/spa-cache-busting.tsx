import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'spa-cache-busting',
  title: 'A deploy ships, but the browser still shows the old page',
  category: 'Frontend',
  summary:
    "ASP.NET Core's default static file middleware sets no Cache-Control header, so browsers fall back to their own caching heuristics and can keep serving yesterday's index.html after a new deploy.",
  tags: ['caching', 'spa', 'vite', 'aspnet-core', 'deployment'],
  isIllustrative: false,
}

export default function SpaCacheBustingPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          After deploying a UI change, reloading the site still shows the previous version -
          sometimes it takes a hard refresh or clearing the cache before the new page shows up.
          It's inconsistent: it depends on the browser and how long it's been since the last visit.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          <code>app.UseStaticFiles()</code> with no options sets no <code>Cache-Control</code>{' '}
          header on anything it serves, <code>index.html</code> included. With no explicit
          instruction, the browser applies its own heuristic caching to a plain HTML response, so
          it isn't guaranteed to ask the server whether a new version exists before reusing what it
          already has - even though a fresh <code>index.html</code> is exactly what points the
          browser at each new build's content-hashed JS and CSS files.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Split the caching policy in two, based on what Vite actually guarantees: files under{' '}
          <code>/assets/</code> are content-hashed - a changed file gets a new filename, so it's
          safe to cache them essentially forever (<code>immutable</code>). Everything else,
          <code>index.html</code> above all, is told <code>no-cache</code> - not "don't cache," but
          "always ask the server whether this is still current" - so the very next visit after a
          deploy gets the new build.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Taken directly from this project's <code>Program.cs</code> - originally from Avantra,
          the only one of this workspace's other myasp.net-deployed projects that had already
          solved this.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Api/Program.cs',
              language: 'csharp',
              code: `var staticFileOptions = new StaticFileOptions
{
    OnPrepareResponse = context =>
    {
        var isHashedAsset = context.File.PhysicalPath?.Replace('\\\\', '/').Contains("/assets/") == true;
        context.Context.Response.Headers.CacheControl = isHashedAsset
            ? "public,max-age=31536000,immutable"
            : "no-cache";
    }
};

app.UseDefaultFiles();
app.UseStaticFiles(staticFileOptions);

app.MapFallbackToFile("index.html", staticFileOptions);`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
