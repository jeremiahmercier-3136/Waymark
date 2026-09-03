import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'postgres-docker',
  title: 'Docker Postgres with a real connection-string secret',
  category: 'Data',
  summary:
    "Copying a project's Docker Compose file for Postgres copies its host port too, so a second project's database can't start while the first one's is already running - and a connection string composed from separate settings isn't really a secret.",
  tags: ['postgres', 'docker', 'user-secrets', 'connection-string'],
  isIllustrative: false,
}

export default function PostgresDockerPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Setting up a local Postgres for a new project either means installing it natively -
          version drift, another always-on background service - or copying an earlier project's
          Docker Compose file, which copies its host port too. Three of this workspace's projects
          (Cadence, MedServ, Runbook) independently ended up with their Postgres container on the
          same host port, so only one of them can have its database running at a time. Separately,
          some setups stored only the password as a secret and composed the rest of the connection
          string (host, port, database, user) from other config - which stops matching reality the
          moment any of those change between environments.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Compose files get copied project to project without checking which host ports are
          already claimed elsewhere in the workspace, and a connection string that's assembled
          from several separate settings has no single point where the whole thing - and only the
          whole thing - is treated as sensitive.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Run Postgres in Docker on a host port nothing else in the workspace uses (check the
          registry below before picking one) - never on the Postgres default, 5432, and never a
          port another project already claimed. Never commit a <code>.env</code> file. A short
          PowerShell script sets the container's environment and requires a{' '}
          <code>Postgres__Password</code> value in the current shell - only to satisfy Postgres's
          own first-run initialization - before calling <code>docker compose up</code>.
        </p>
        <p>
          The application itself never composes its connection string from separate settings: it
          reads one full connection string from <strong>.NET user secrets</strong> locally (set
          once with <code>dotnet user-secrets set</code>), and in production the whole string -
          not just the password - is a GitHub repo secret merged into{' '}
          <code>appsettings.Production.json</code> at deploy time, the same mechanism documented in{' '}
          <Link to="/markers/myasp-deploy">myasp-deploy</Link>. It's never an app pool environment
          variable.
        </p>
        <p className="note">
          Waymark itself has no database yet, so none of this is wired into{' '}
          <code>Waymark.Api</code> - this records the pattern for whenever a Waymark feature
          actually needs one, rather than adding an unused Postgres dependency speculatively.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Taken from Cadence, ModelMosaic, MedServ, and Avantra.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'compose.yaml - Postgres in Docker on a non-standard, project-specific port',
              language: 'yaml',
              code: `services:
  postgres:
    image: postgres:17
    environment:
      POSTGRES_DB: \${POSTGRES_DB}
      POSTGRES_USER: \${POSTGRES_USER}
      POSTGRES_PASSWORD: \${POSTGRES_PASSWORD}
    ports:
      - "\${POSTGRES_PORT}:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U $\${POSTGRES_USER} -d $\${POSTGRES_DB}"]
      interval: 5s
      timeout: 5s
      retries: 10
    volumes:
      - myapp-postgres:/var/lib/postgresql/data

volumes:
  myapp-postgres:`,
            }}
          />
          <CodeBlock
            example={{
              label: 'scripts/postgres.ps1 - from ModelMosaic and Avantra, identical in both',
              language: 'powershell',
              code: `param([ValidateSet("up", "down")] [string]$Action = "up")
$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
if ($Action -eq "up" -and [string]::IsNullOrWhiteSpace($env:Postgres__Password)) {
  throw "Postgres__Password is not configured for this shell."
}
$env:POSTGRES_DB = "myapp"
$env:POSTGRES_USER = "myapp"
$env:POSTGRES_PORT = "5435"
$env:POSTGRES_PASSWORD = $env:Postgres__Password
try {
  if ($Action -eq "up") { docker compose --project-directory $root up -d }
  else { docker compose --project-directory $root down }
  if ($LASTEXITCODE -ne 0) { throw "docker compose $Action failed." }
}
finally {
  Remove-Item Env:POSTGRES_DB, Env:POSTGRES_USER, Env:POSTGRES_PORT, Env:POSTGRES_PASSWORD -ErrorAction SilentlyContinue
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Setting the connection string as one user secret (from ModelMosaic)',
              language: 'powershell',
              code: `$env:Postgres__Password = 'your-password'
npm run db:start
dotnet user-secrets set "ConnectionStrings:MyApp" \`
  "Host=localhost;Port=5435;Database=myapp;Username=myapp;Password=your-password" \`
  --project MyApp.Api`,
            }}
          />
          <CodeBlock
            example={{
              label: 'package.json (root) - wiring the database into one dev command',
              language: 'json',
              code: `{
  "scripts": {
    "db:start": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/postgres.ps1 -Action up",
    "db:stop": "powershell -NoProfile -ExecutionPolicy Bypass -File scripts/postgres.ps1 -Action down",
    "dev": "npm run db:start && concurrently --kill-others \\"npm run api\\" \\"npm run web:wait\\""
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Workspace Postgres port registry - check before picking a new one',
              language: 'text',
              code: `Project        Host port   Notes
ModelMosaic     5432       standard port - the one exception
Cadence         5434       |
MedServ         5434       |- three-way collision
Runbook         5434       |
Avantra         55432
(next new project)  5435  <- first free non-standard port`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
