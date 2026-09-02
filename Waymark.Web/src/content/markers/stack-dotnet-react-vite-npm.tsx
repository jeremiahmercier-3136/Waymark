import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'stack-dotnet-react-vite-npm',
  title: 'Default stack: ASP.NET Core, React, Vite, npm',
  category: 'Architecture',
  summary:
    "Re-deciding a project's backend, frontend, build tool, and package manager from scratch wastes the same hour every time; this workspace settled on one default shape.",
  tags: ['dotnet', 'react', 'vite', 'npm', 'architecture'],
  isIllustrative: false,
}

export default function StackDotnetReactViteNpmPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Starting a new small project raises the same open questions again - Express or ASP.NET
          Core? Create React App, Next.js, or Vite? npm, pnpm, or yarn? - before any actual feature
          work starts.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The decision was never written down anywhere, so each new project re-litigated tooling
          choices that had already been made and had already worked well elsewhere in this
          workspace.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Default new projects to ASP.NET Core (minimal APIs) for the backend, React + TypeScript +
          Vite for the frontend, and npm for package management, with a single ASP.NET Core host
          serving both the API and the built web app - as this project itself does. Deviate only
          when a project has a concrete reason to.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Taken directly from this project - see{' '}
          <a href="https://github.com/jeremiahmercier-3136/Waymark/blob/main/Waymark.Web/vite.config.ts">
            Waymark.Web/vite.config.ts
          </a>{' '}
          and{' '}
          <a href="https://github.com/jeremiahmercier-3136/Waymark/blob/main/Waymark.Api/Program.cs">
            Waymark.Api/Program.cs
          </a>
          .
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Web/vite.config.ts',
              language: 'typescript',
              code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { port: 5178, proxy: { '/api': 'http://localhost:5119' } },
})`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Api/Program.cs',
              language: 'csharp',
              code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

app.UseDefaultFiles();
app.UseStaticFiles();

var api = app.MapGroup("/api");
api.MapGet("/health", () => Results.Ok(new { status = "ok" }));

app.MapFallbackToFile("index.html");
app.Run();`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
