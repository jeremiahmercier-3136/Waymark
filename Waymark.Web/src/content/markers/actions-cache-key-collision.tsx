import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'actions-cache-key-collision',
  title: 'GitHub Actions cache key collides across branches',
  category: 'CI/CD',
  summary:
    "Two branches building the same lockfile hash share a cache entry, so a build on one branch can pick up artifacts affected by a different branch's failed run.",
  tags: ['github-actions', 'caching'],
  isIllustrative: true,
}

export default function ActionsCacheKeyCollisionPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A build fails intermittently in a way that isn't reproducible locally and isn't tied to
          any code change on that branch.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          The cache key was derived only from the lockfile hash, with no branch or workflow-run
          scoping, so unrelated branches share state.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Scope the cache key to the branch (or a restore-keys fallback chain) instead of the
          lockfile hash alone.
        </p>
      </section>
    </article>
  )
}
