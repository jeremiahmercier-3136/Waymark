import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'spa-cache-busting',
  title: 'A deploy ships, but the browser still shows the old page',
  category: 'Frontend',
  summary:
    "ASP.NET Core's default static file middleware sets no Cache-Control header, so browsers fall back to their own caching heuristics and can keep serving yesterday's index.html after a new deploy. An audit found six of this workspace's projects had never actually wired this up.",
  tags: ['caching', 'spa', 'vite', 'aspnet-core', 'deployment', 'favicon'],
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
        <p>
          A favicon specifically can look like a worse case of the same problem: reloading
          AtlantisTech right after replacing its favicon still showed the old one. Auditing turned
          up two separate things going on there, not one. First, AtlantisTech had never wired up
          this marker's fix at all - plain <code>UseStaticFiles()</code> with no options, so{' '}
          <em>nothing</em> it served had a deliberate <code>Cache-Control</code> header, favicon
          included. Second, even once that's fixed, a favicon specifically is a real exception -
          see the note in Resolution below - so it can still take a hard refresh once, and that's
          not this fix failing.
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
        <p>
          This had only ever been fixed in the projects that happened to copy it from Avantra or
          from each other. Nothing made it a default, so it silently didn't happen everywhere else.
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
        <p className="note">
          A favicon is a real exception to that promise, not a bug in it. Browsers fetch a tab icon
          through a separate path from ordinary page resources - it isn't refetched on every
          navigation the way <code>index.html</code>, CSS, and JS are, and several browsers cache
          it well past whatever <code>Cache-Control</code> says, sometimes for the life of the
          browser profile. A correct <code>no-cache</code> header is still the right thing to send;
          it just isn't sufficient on its own for a favicon specifically the way it is for
          everything else this marker covers. If a favicon change needs to show up immediately
          rather than eventually, the reliable fix is changing the icon's own URL (a cache-busting
          query string, or a new filename) rather than trusting headers - the same logic that makes{' '}
          <code>/assets/</code> filenames content-hashed in the first place, applied to the one
          resource type that doesn't otherwise get revalidated. An ordinary <code>{'<img>'}</code>{' '}
          logo in the page itself doesn't have this problem; it's fetched like any other page
          resource and correctly picks up a <code>no-cache</code> revalidation on the next load.
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
        <p className="note">
          Already correct: Waymark, Avantra, DMGPT, and the four personal sites (JeremiahMercier,
          Ravenfrost, AndreRene, LucNathanael). Missing this entirely and now fixed: AtlantisTech,
          Cadence, MedServ, ModelMosaic, Runbook, and Virtual911 - Cadence already had a{' '}
          <code>StaticFileOptions</code> object for an unrelated reason (a custom{' '}
          <code>ContentTypeProvider</code> for <code>.apk</code> files), which is why it looked
          handled at a glance but wasn't. Not applicable: Bizfront's three tracks use a Razor Pages
          app with .NET's built-in <code>MapStaticAssets()</code> (Main, which fingerprints and
          caches automatically) and vendor CMS asset pipelines (OrchardCore, Umbraco) rather than a
          Vite build with this project's <code>/assets/</code> convention.
        </p>
      </section>
    </article>
  )
}
