import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'cors-preflight-blocked-by-auth-middleware',
  title: 'CORS preflight blocked by auth middleware order',
  category: 'Auth',
  summary:
    'Browser preflight OPTIONS requests get rejected with 401 because authentication middleware runs before CORS middleware.',
  tags: ['cors', 'middleware', 'aspnet-core'],
  isIllustrative: true,
}

export default function CorsPreflightBlockedByAuthMiddlewarePage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Every cross-origin POST fails in the browser with a CORS error, even though the same
          request works fine from a REST client.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The OPTIONS preflight request carries no credentials, so if auth middleware runs first it
          rejects the request before CORS headers are ever added to the response.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Register CORS middleware ahead of authentication/authorization in the pipeline so
          preflight requests are answered before any auth check runs.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Problem',
              language: 'csharp',
              code: `app.UseAuthentication();
app.UseAuthorization();
app.UseCors("Default"); // too late for preflight`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Fix',
              language: 'csharp',
              code: `app.UseCors("Default");
app.UseAuthentication();
app.UseAuthorization();`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
