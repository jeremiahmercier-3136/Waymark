import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'no-committed-secrets',
  title: 'Never commit secrets; review the diff for them every time',
  category: 'Security',
  summary:
    'Local debugging naturally produces files with real or test credentials in them - the only thing standing between that and a secret landing in history is reviewing the diff before every commit, not remembering not to type a password into a tracked file.',
  tags: ['secrets', 'credentials', 'process', 'agents-md'],
  isIllustrative: false,
}

export default function NoCommittedSecretsPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          While debugging why Orchard Core's unattended setup module wasn't triggering (Bizfront's{' '}
          <code>OrchardCore</code> track), isolating the problem meant writing a real tenant-setup
          config - including an admin password - directly into <code>appsettings.json</code>, a
          file that's tracked and would otherwise go straight into the next commit. The proper
          version of that same password was already sitting safely in local user-secrets; the
          tracked file only had it because a debugging shortcut put it there.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Almost every project in this workspace already writes "never commit secrets" down -
          AtlantisTech, Avantra, Cadence, MedServ, ModelMosaic, and Virtual911 all have some form of
          it in their own <code>AGENTS.md</code>. But that rule doesn't come free with a new
          project; it has to actually be copied in. Bizfront didn't have an <code>AGENTS.md</code>{' '}
          at all yet, so there was nothing written down to make "review the diff before committing"
          the default reflex instead of something that has to be remembered fresh every time.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Two rules, not one - "don't type secrets into tracked files" catches the moment of
          writing, but a debugging shortcut or a copy-pasted example will slip past it anyway.
          "Review the pending changes for secrets before every commit" is the backstop that catches
          it regardless of how it got there. In this case the test password was caught and reverted
          before staging, precisely because reviewing the diff for credentials is already part of
          Bizfront's own commit process - the fix here is putting that same expectation in writing
          in <code>AGENTS.md</code> so it isn't only implicit in one document's process section.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Added to Bizfront's <code>AGENTS.md</code>, matching the shorter version already present
          in most other projects in this workspace, plus the explicit before-every-commit review
          step this marker exists to record.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AGENTS.md',
              language: 'markdown',
              code: `- Never place credentials or secrets in source control; keep them in user-secrets, environment
  variables, or an untracked local file instead.
- Before every commit, review the pending changes (\`git status\`, \`git diff\`) for credentials, API
  keys, connection strings, or other secrets - including in files a change only touched for
  debugging, not just the files a change was intended to touch.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
