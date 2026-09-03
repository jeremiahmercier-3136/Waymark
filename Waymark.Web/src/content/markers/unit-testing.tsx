import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'unit-testing',
  title: 'Unit testing: xUnit for the API, Vitest for the UI',
  category: 'Testing',
  summary:
    'Nothing said which test framework a new project should reach for, so the UI side of new projects often shipped with no test setup at all - Waymark included, until this marker.',
  tags: ['xunit', 'vitest', 'testing-library', 'testing'],
  isIllustrative: false,
}

export default function UnitTestingPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          The API side of every project in this workspace already tests the same way, but that
          was never written down, so a new project's UI just as easily ends up with no test setup
          at all - Waymark's own web app had none until this marker.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>The convention existed only as five separate projects' <code>.csproj</code> and{' '}
          <code>package.json</code> files, not as anything a new project could be checked against.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          <strong>API:</strong> xUnit, run as integration tests through{' '}
          <code>Microsoft.AspNetCore.Mvc.Testing</code>'s <code>WebApplicationFactory&lt;Program&gt;</code>{' '}
          against the real app pipeline rather than mocking it apart - a project-reference to the API
          project plus one global <code>Using Include="Xunit"</code> is the whole setup.
        </p>
        <p>
          <strong>UI:</strong> Vitest with <code>@testing-library/react</code> (plus{' '}
          <code>jest-dom</code> matchers and <code>user-event</code> for interaction), running in a{' '}
          <code>jsdom</code> environment configured directly in <code>vite.config.ts</code> - no
          separate Jest config, no separate test runner. Every test file that renders more than once
          needs its own <code>afterEach(cleanup)</code>; nothing in this stack registers that
          automatically.
        </p>
        <p>
          Both sides wire into one <code>npm run test</code> at the repo root, and CI runs both
          before every deploy.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Taken from this project's own test setup, added when this marker was written, following
          the convention already established by Cadence, MedServ, and Avantra.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Waymark.Api.Tests/HealthEndpointTests.cs',
              language: 'csharp',
              code: `public class HealthEndpointTests(WebApplicationFactory<Program> factory)
    : IClassFixture<WebApplicationFactory<Program>>
{
    [Fact]
    public async Task Health_returns_ok()
    {
        var client = factory.CreateClient();
        var response = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Web/vite.config.ts - test block',
              language: 'typescript',
              code: `import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
export default defineConfig({
  plugins: [react()],
  server: { port: 5179, proxy: { '/api': 'http://localhost:5119' } },
  test: { environment: 'jsdom', setupFiles: './src/test-setup.ts' },
})`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Web/src/test-setup.ts',
              language: 'typescript',
              code: `import '@testing-library/jest-dom/vitest'`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Waymark.Web/src/pages/CatalogPage.test.tsx (excerpt)',
              language: 'tsx',
              code: `describe('CatalogPage', () => {
  afterEach(cleanup)

  it('filters the catalog down to one category', async () => {
    const user = userEvent.setup()
    render(<MemoryRouter><CatalogPage /></MemoryRouter>)

    await user.click(screen.getByRole('button', { name: 'Data' }))

    expect(screen.getByRole('heading', { name: 'Docker Postgres with a real connection-string secret' }))
      .toBeInTheDocument()
  })
})`,
            }}
          />
          <CodeBlock
            example={{
              label: 'package.json (root) - one command for both',
              language: 'json',
              code: `{
  "scripts": {
    "test:api": "dotnet test Waymark.slnx",
    "test:web": "npm --prefix Waymark.Web run test",
    "test": "npm run test:api && npm run test:web"
  }
}`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
