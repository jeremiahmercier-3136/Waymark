import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'tech-stack',
  title: 'Preferred tech stack: ASP.NET Core, React, Vite, npm',
  category: 'Architecture',
  summary:
    "Re-deciding a project's backend, frontend, build tool, package manager, and folder layout from scratch wastes the same hour every time; this workspace settled on one default shape.",
  tags: ['dotnet', 'react', 'vite', 'npm', 'architecture'],
  isIllustrative: false,
}

export default function TechStackPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Starting a new small project raises the same open questions again - Express or ASP.NET
          Core? Create React App, Next.js, or Vite? npm, pnpm, or yarn? Where do the projects live
          relative to each other? - before any actual feature work starts.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The decision was never written down anywhere, so each new project re-litigated tooling
          and layout choices that had already been made and had already worked well elsewhere in
          this workspace.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Default new projects to ASP.NET Core (minimal APIs) for the backend, React + TypeScript +
          Vite for the frontend, and npm for package management, with a single ASP.NET Core host
          serving both the API and the built web app - as this project itself does. Keep the same
          folder layout too: <code>{'<Name>.Api'}</code>, <code>{'<Name>.Api.Tests'}</code>,{' '}
          and <code>{'<Name>.Web'}</code> as siblings at the repo root, one{' '}
          <code>.slnx</code> referencing the .NET projects, and a root{' '}
          <code>package.json</code> whose scripts orchestrate both <code>dotnet</code> and{' '}
          <code>npm</code> commands so the whole project can be run and built with one command
          each. Deviate only when a project has a concrete reason to.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Taken directly from this project.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Folder layout',
              language: 'text',
              code: `Waymark/
├── Waymark.slnx
├── package.json          # orchestrates dotnet + npm via root scripts
├── Waymark.Api/          # ASP.NET Core host: /api + serves the built web app
├── Waymark.Api.Tests/    # API tests
└── Waymark.Web/          # React + TypeScript + Vite UI
    └── src/
        ├── content/markers/  # one page component per marker
        ├── components/
        └── pages/`,
            }}
          />
          <CodeBlock
            example={{
              label: 'package.json (root)',
              language: 'json',
              code: `{
  "scripts": {
    "dev": "concurrently --kill-others \\"npm run api\\" \\"npm run web:wait\\"",
    "build": "npm run build:api && npm run build:web",
    "restore": "npm run restore:api && npm run restore:web",
    "test": "dotnet test Waymark.slnx",
    "lint": "npm --prefix Waymark.Web run lint"
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Web/vite.config.ts',
              language: 'typescript',
              code: `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { port: 5179, proxy: { '/api': 'http://localhost:5119' } },
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
