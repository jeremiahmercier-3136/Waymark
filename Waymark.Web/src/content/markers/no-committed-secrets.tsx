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
          Isolating a bug means writing a real credential - an admin password, a connection string -
          directly into a tracked config file to reproduce the problem locally. The safe version was
          already sitting in user-secrets; the tracked file only has it because a debugging shortcut
          put it there, and it's now one commit away from going into history.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          "Don't commit secrets" doesn't stop this: a debugging shortcut isn't the moment anyone
          thinks of as "typing a secret in," so the rule needs a second, unconditional backstop that
          doesn't rely on remembering the first one.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Two rules, not one - "don't type secrets into tracked files" catches the moment of
          writing, but a debugging shortcut or a copy-pasted example will slip past it anyway.
          "Review the pending changes for secrets before every commit" is the backstop that catches
          it regardless of how it got there.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          The two-rule form every project's <code>AGENTS.md</code> should carry.
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
