import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'ef-core-migration-drift',
  title: 'EF Core migration drifts after a rename',
  category: 'Data',
  summary:
    'Renaming a property or table without a migration leaves the model and the database silently out of sync.',
  tags: ['ef-core', 'migrations', 'postgresql'],
  isIllustrative: true,
}

export default function EfCoreMigrationDriftPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Queries throw a column-not-found error in an environment that wasn't rebuilt from
          scratch, even though local development works fine.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          A rename was made directly in C# without generating a migration, so only environments
          with a fresh database - not an incrementally migrated one - reflect the change.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Treat every model rename as two steps: rename in code, then immediately generate and
          commit the migration in the same change, never as a follow-up.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Problem',
              language: 'csharp',
              code: `public sealed class Order
{
    public int Id { get; set; }
    public decimal TotalAmount { get; set; } // renamed from \`Total\`, no migration generated
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Fix',
              language: 'bash',
              code: `# in the same change that renames Total -> TotalAmount
dotnet ef migrations add RenameOrderTotalToTotalAmount
dotnet ef database update`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
