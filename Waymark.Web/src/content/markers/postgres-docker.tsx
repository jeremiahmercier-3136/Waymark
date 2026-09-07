import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'postgres-docker',
  title: 'A connection-string template plus a password secret, joined at runtime',
  category: 'Data',
  summary:
    "Copying a project's Docker Compose file for Postgres copies its host port too, so a second project's database can't start while the first one's is already running. Separately, treating a whole connection string as one opaque secret leaves its non-secret parts (host, port, database, user) unreviewable in a diff, and makes wiring up a GitHub secret feel heavier than it needs to.",
  tags: ['postgres', 'docker', 'user-secrets', 'connection-string', 'agents-md'],
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
          Docker Compose file, which copies its host port too, so two projects' containers collide
          and only one can have its database running at a time.
        </p>
        <p>
          Separately, treating a whole connection string as one opaque secret means there's no way
          to review host, port, database name, or username in a diff - a connection string quietly
          pointed at the wrong server is invisible until something breaks. And treating the entire
          thing as equally sensitive makes wiring up a GitHub secret feel heavier than it needs to,
          which nudges toward setting the real production connection string as a myASP.NET
          application-environment variable by hand instead - exactly the pattern{' '}
          <Link to="/markers/myasp-deploy">myasp-deploy</Link> exists to replace.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Compose files get copied project to project without checking which host ports are
          already claimed elsewhere in the workspace.
        </p>
        <p>
          .NET's <code>ConnectionStrings</code> configuration section has exactly one contract -
          every key under it is a complete, ready-to-use connection string - so treating "the whole
          thing" as the secret leaves no correct place to keep the non-secret parts (host, port,
          database, username) reviewable. The password is the only part that's actually a
          credential; folding the rest into the same opaque secret makes it unreviewable for no
          reason.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Split the connection string in two, without going back to separate host/port/database/
          user settings. <code>ConnectionStrings:{'{App}'}</code> holds a complete connection
          string template with the password field left empty - non-secret, committed to both{' '}
          <code>appsettings.Development.json</code> and <code>appsettings.Production.json</code>,
          fully reviewable in every diff. A single top-level <code>DatabasePassword</code> setting
          holds only the password - a .NET user secret locally, a GitHub Actions secret (never a
          variable, see below) in production. It's a flat name, not qualified by app, because each
          of these apps has exactly one database.
        </p>
        <p>
          Neither environment ever sees a hand-composed connection string. A few lines at the top
          of <code>Program.cs</code>, run identically in dev, test, and production, parse the
          template with the driver's own connection-string builder (<code>NpgsqlConnectionStringBuilder</code>{' '}
          for Postgres) and set <code>.Password</code> on it before anything reads the connection
          string. That's the same join logic every time the app starts, dev included - a broken
          template or an escaping bug shows up the next time you run locally, not the first time
          it's deployed. It also means the GitHub Actions side gets simpler, not more complex: the
          deploy workflow only ever merges one flat secret value into{' '}
          <code>appsettings.Production.json</code>, never a connection string it would have to
          parse and rebuild itself.
        </p>
        <p>
          Two rules that go with this, both already true in this workspace and worth stating
          directly rather than leaving implicit:
        </p>
        <p>
          Never a <code>.env</code> file, for a connection string or anything else - this
          workspace's local secret store is .NET user-secrets.
        </p>
        <p>
          A GitHub Actions <strong>secret</strong>, never a GitHub Actions <strong>variable</strong>.
          Actions <code>vars</code> are unencrypted and visible in the UI and in logs - fine for a
          site name, a server hostname, a public URL. Actions <code>secrets</code> are encrypted
          and redacted from logs - the only place a password, API key, or token belongs.{' '}
          <code>DatabasePassword</code>, and any other real secret, is a <code>secrets.*</code>{' '}
          reference, full stop.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          The shape used by every project in this workspace with a real Postgres connection string.
        </p>
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
              label: 'appsettings.Development.json / appsettings.Production.json - the template, committed',
              language: 'json',
              code: `{
  "ConnectionStrings": {
    "MyApp": "Host=localhost;Port=5435;Database=myapp;Username=myapp;Password="
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Program.cs - the same join in dev and production',
              language: 'csharp',
              code: `var builder = WebApplication.CreateBuilder(args);

// Join the committed, password-less connection-string template with the DatabasePassword
// secret (a user-secret locally, a GitHub Actions secret in production) - see Waymark's
// postgres-docker marker. Same join every time the app starts, dev included.
var connectionStringTemplate = builder.Configuration.GetConnectionString("MyApp");
var databasePassword = builder.Configuration["DatabasePassword"];
if (!string.IsNullOrWhiteSpace(connectionStringTemplate) && !string.IsNullOrWhiteSpace(databasePassword))
{
    builder.Configuration["ConnectionStrings:MyApp"] = new Npgsql.NpgsqlConnectionStringBuilder(connectionStringTemplate)
    {
        Password = databasePassword
    }.ConnectionString;
}

builder.Services.AddDbContext<MyAppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("MyApp")));`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Setting the local secret - just the password, not the whole string',
              language: 'powershell',
              code: `$env:Postgres__Password = 'your-password'
npm run db:start
dotnet user-secrets set "DatabasePassword" "your-password" --project MyApp.Api`,
            }}
          />
          <CodeBlock
            example={{
              label: '.github/workflows/deploy.yml - merging one flat secret, nothing to parse',
              language: 'yaml',
              code: `- name: Write production application settings
  env:
    DATABASE_PASSWORD: \${{ secrets.MYAPP_DB_PASSWORD }}
  run: |
    if ([string]::IsNullOrWhiteSpace($env:DATABASE_PASSWORD)) { throw 'MYAPP_DB_PASSWORD is not configured.' }
    $settingsPath = Join-Path $PWD 'publish/appsettings.Production.json'
    $settings = if (Test-Path $settingsPath) {
      Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
    } else { @{} }
    $settings.DatabasePassword = $env:DATABASE_PASSWORD
    [System.IO.File]::WriteAllText(
      $settingsPath,
      ($settings | ConvertTo-Json -Depth 5),
      [System.Text.UTF8Encoding]::new($false))
    # The connection-string template itself needs no CI step at all - it's already committed
    # in appsettings.Production.json and travels with the publish output unmodified.`,
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
