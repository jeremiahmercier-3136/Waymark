import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'webdeploy-silently-skips',
  title: 'Web Deploy step silently skips with blank secrets',
  category: 'Deployment',
  summary:
    'A CI deploy step reports green but never deploys, because required secrets were never configured on a freshly created repo.',
  tags: ['ci', 'github-actions', 'deploy'],
  isIllustrative: true,
}

export default function WebDeploySilentlySkipsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>The GitHub Actions run finishes successfully with no errors, but the site never updates.</p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The workflow step conditionally skips the actual deploy when required secrets are empty
          or left as placeholder values, and that skip isn't loud enough to notice.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Add an explicit warning step that fires whenever any deploy secret is missing or still a
          placeholder, so a silent no-op is visible in the run log.
        </p>
      </section>
    </article>
  )
}
