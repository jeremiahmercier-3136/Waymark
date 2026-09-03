import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'auto-ef-migrations',
  title: 'Applying EF Core migrations automatically in production',
  category: 'Data',
  summary:
    "myasp.net gives no way to run a one-off command against the production database, so a migration that isn't applied automatically at startup doesn't get applied at all.",
  tags: ['ef-core', 'migrations', 'postgresql', 'deployment'],
  isIllustrative: false,
}

export default function AutoEfMigrationsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Code that expects a new column, table, or index ships and starts throwing
          column/table-not-found errors in production, even though the exact same code works fine
          locally - because the deployed database schema never got the migration that created
          those the local one already has.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          There's no shell on the production host to run <code>dotnet ef database update</code>{' '}
          by hand, and deploying new code doesn't apply pending migrations by itself - something
          has to call <code>Database.MigrateAsync()</code>, and if nothing does, the schema simply
          stays behind.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Run pending migrations against the real database as part of application startup, in a
          scope created right after <code>app.Build()</code>, before the app starts serving
          requests - so a deploy and a schema update happen as one atomic step, and a project
          following <Link to="/markers/tech-stack">tech-stack</Link>'s single-host pattern never
          needs a separate migration step in the deploy workflow at all.
        </p>
        <p>
          Guard it with <code>IsRelational()</code> first - a test host using EF Core's in-memory
          provider has no migrations to apply, and calling <code>MigrateAsync()</code> against it
          throws. Log success explicitly, and let a migration failure crash startup rather than
          serving requests against a schema the app doesn't actually match - a loud failure here is
          far better than a confusing one later, several requests deep.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Taken from Cadence.Api/Program.cs; ModelMosaic and Avantra apply the same call more tersely.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Program.cs - after app.Build(), before app.Run()',
              language: 'csharp',
              code: `using (var scope = app.Services.CreateScope())
{
    var logger = scope.ServiceProvider.GetRequiredService<ILoggerFactory>().CreateLogger("Startup");
    var database = scope.ServiceProvider.GetRequiredService<MyAppDbContext>().Database;
    if (database.IsRelational())
    {
        try
        {
            await database.MigrateAsync();
            logger.LogInformation("Database migrations are current.");
        }
        catch (Exception exception)
        {
            logger.LogCritical(exception, "Database migration failed during startup.");
            throw;
        }
    }
}`,
            }}
          />
        </div>
        <p className="note">
          Waymark has no database yet (see <Link to="/markers/postgres-docker">postgres-docker</Link>),
          so nothing here is wired into <code>Waymark.Api</code> - this records where the call goes
          once a migration exists to apply.
        </p>
      </section>
    </article>
  )
}
