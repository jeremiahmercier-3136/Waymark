import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'no-secrets-in-session',
  title: "A generated secret's value shouldn't appear in the AI session either",
  category: 'Security',
  summary:
    "An agent asked to generate production secrets can end up printing the generated values into the chat so the account holder has a copy - real secret values sitting in a session transcript, the same unmanaged persistence problem no-committed-secrets already named for source control, just never named for this.",
  tags: ['secrets', 'credentials', 'process', 'agents-md', 'agent-behavior'],
  isIllustrative: false,
}

export default function NoSecretsInSessionPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Asked to provision a mix of database passwords, CMS admin passwords, and an internal
          signing key for a production deploy, an agent generates the account-holder-independent
          values itself and prints them directly into its chat response so there's a record of
          them - real secret values sitting in plain text in the session transcript, before ever
          being asked whether that's the right way to hand them over.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          <code>AGENTS.md</code>'s existing secrets rule (see{' '}
          <code>no-committed-secrets</code>) only ever covered source control - "never commit
          secrets," "review the diff before every commit." Nothing said an agent shouldn't display
          a secret value it generated, as long as it never touched a tracked file. But a session
          transcript is the same kind of unmanaged persistence surface a committed file is: logged,
          potentially retained or shared, with none of the access control or rotation story a real
          secret store has.
        </p>
        <p>
          Not every secret needs the same handling, either. A credential tied to something that
          already exists outside the repo (a database) can only come from the account holder - no
          reason to generate it at all. Among secrets an agent legitimately can generate, the
          question that decides how to hand one over is whether anything outside the app will ever
          need to read it back: a newly created admin password is a login the account holder must
          personally retain going forward; an internal signing/HMAC key nothing ever displays back
          has no such need.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          For a secret nothing outside the app needs to read back: generate it and pipe it directly
          into the target secret store (a
          GitHub Actions secret, here) in one shell step, with no command in that step that echoes
          the value to any output the session reads back. The value should exist only transiently
          inside the shell process that sets it - never in a file the agent reads back with{' '}
          <code>cat</code>, never in a variable interpolated into a message, never in a command's
          own stdout.
        </p>
        <p>
          For a secret the account holder must personally retain (e.g. a newly created admin login),
          there's a real tension and no clean way around it: GitHub Actions secrets are write-only
          (there's no <code>gh secret get</code>), so if the agent generates the value, the only way
          the account holder ends up with a copy is the agent displaying it once. Prefer having the
          account holder generate and set secrets like this themselves when practical, sidestepping
          the problem entirely. When an agent does have to generate one, treat whatever got
          displayed as compromised the moment it's shown - confirm the account holder saved it, then
          rotate it, the same way credential-exposure incidents get handled anywhere else.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Added to Bizfront's <code>AGENTS.md</code>, alongside the existing{' '}
          <code>no-committed-secrets</code> rule rather than replacing it.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'AGENTS.md',
              language: 'markdown',
              code: `- Never print, echo, or otherwise let a secret value appear in the AI session/conversation itself -
  not just source control. A session transcript is another persistence surface outside the
  designated secret stores (user-secrets, GitHub Actions secrets), logged and potentially retained
  or shared the same way a committed file is. When a secret must be generated (not chosen by the
  account holder, e.g. an internal signing/HMAC key nothing ever displays back), generate it and
  pipe it directly into the target secret store in one step, with no command that echoes the value
  to any output the session reads back - the value should exist only transiently in the shell that
  sets it. The one exception is a secret the account holder must personally retain going forward
  (e.g. a newly created admin login password) - GitHub Actions secrets are write-only, so there's no
  way to hand it over except displaying it once at creation time; even then, prefer letting the
  account holder set it themselves when practical, and treat a value you did have to display as
  compromised - rotate it once the account holder has confirmed they saved it.`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Generate-and-pipe with no echo, for a secret nobody needs to read back',
              language: 'bash',
              code: `# The generated value never appears in this command's own text, and nothing in the
# command prints it - "rotated" below is the only output, never the key itself.
VALUE=$(python3 -c "import secrets; print(secrets.token_hex(32))") \\
  && gh secret set UMBRACO_HMAC_SECRET_KEY --body "$VALUE" \\
  && unset VALUE
echo "rotated (value never echoed)"

# Contrast with what actually happened first: writing the generated value to a scratch
# file, then reading it back with cat to confirm it - the cat output became part of the
# session transcript, which is the leak this marker exists to prevent.`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
