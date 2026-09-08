import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'ovh-vps-deploy',
  title: 'Two-tier SSH for an OVH VPS: personal admin key, unprivileged deploy key',
  category: 'Deployment',
  summary:
    "A project that genuinely needs full container control - a private background worker, arbitrary Docker services, self-service TLS/subdomain automation - can't run on myasp.net's shared IIS hosting, but a VPS hands out root access that has to be fenced off from CI and from an agent, or every project re-derives (or under-thinks) that boundary for itself.",
  tags: ['ovh', 'vps', 'ssh', 'docker', 'caddy', 'deployment', 'github-actions', 'agent-behavior'],
  isIllustrative: false,
}

export default function OvhVpsDeployPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Standing up a second VPS-hosted project after Avantra meant re-deriving the same SSH
          bootstrap from memory: which key is passphrase-protected, which one CI and an agent are
          allowed to touch, and where the boundary between them actually sits. Doing this live for
          Bizfront, an agent session initially got that boundary wrong - it planned to have the
          account holder load the passphrase-protected admin key into a Windows{' '}
          <code>ssh-agent</code> specifically so the agent's own SSH commands could reuse it for
          root-level provisioning, before being corrected.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          myasp.net's shared IIS app pool (see <Link to="/markers/myasp-deploy">myasp-deploy</Link>)
          works for an ordinary ASP.NET Core site, but has no path at all - control panel only,
          nothing scriptable - for what some projects genuinely need: a long-running non-.NET
          background service (Avantra's Python/Playwright browser worker needs a real
          Chromium/CDP process, not something IIS hosts), arbitrary Docker containers, or
          API-driven TLS/subdomain automation (Bizfront's per-tenant wildcard certificates). A VPS
          is the only way to get any of that, but it also hands out a root-capable account, and
          root is a much bigger blast radius than anything myasp.net ever exposes. That needs an
          explicit, structural access-control pattern - otherwise an agent (or a rushed human) ends
          up reaching for whichever credential happens to be available, not whichever one the task
          actually needs.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Reach for a VPS only when myasp.net truly cannot do the job - not as a default and not as
          an upgrade. Two real cases so far: Avantra (a private Python/Playwright browser-automation
          worker needing real CDP/Chromium access) and Bizfront (self-service per-tenant subdomains
          and wildcard TLS via DNS-01, which myasp.net/SmarterASP.NET has no API for at all). Every
          other project in this workspace stays on myasp.net.
        </p>
        <p>
          Architecture: one OVH Ubuntu VPS, Docker Compose, Caddy as the only service with
          published ports (80/443) - it reverse-proxies to every other container over the private
          Docker network and handles TLS automatically. Nothing else is ever bound to a host port
          directly; a database, for instance, is reachable only from other containers or via{' '}
          <code>docker compose exec</code> (see{' '}
          <Link to="/markers/postgres-docker">postgres-docker</Link> for the same private-by-default
          instinct applied to a connection string).
        </p>
        <p>
          Two SSH identities, and the split is a hard access-control boundary, not just a
          convenience:
        </p>
        <ul>
          <li>
            A <strong>personal, passphrase-protected key</strong> (logs in as <code>ubuntu</code>,
            full sudo) for the account holder only. Manual administration - OS packages,
            hand-editing Caddy, creating the deploy account - never scripted, never automated, and
            never loaded anywhere an agent's own commands could pick it up. Even once it's sitting
            in a local <code>ssh-agent</code> for the human's own convenience, an agent's SSH
            commands must still always target the unprivileged identity below, never this one - the
            fix isn't "don't hand the agent the passphrase," it's a structural rule about which
            identity the agent is allowed to use at all, independent of what's technically reachable
            in the shell it's running in.
          </li>
          <li>
            A second key with an <strong>empty passphrase</strong>, for a dedicated non-root{' '}
            <code>deploy</code> user in the <code>docker</code> group only - not <code>sudo</code>.
            This is the only identity GitHub Actions or an agent ever use, always with{' '}
            <code>BatchMode=yes</code> so it can never fall back to an interactive password prompt.
            It can run <code>docker compose</code> against the live stack, but it structurally
            cannot become root even if instructed to.
          </li>
        </ul>
        <p>
          Deploy workflow: test → build → package the repo → <code>scp</code> it to the VPS → write{' '}
          <code>.env.production</code> from repo secrets → <code>docker compose ... up -d --build
          --remove-orphans</code> → verify <code>/health</code>. Gate the whole job on the relevant
          host/user/domain repo variables being set, so it's a no-op in a repo that hasn't
          configured deployment yet.
        </p>
        <p>
          Same secret-vs-variable split as <code>myasp-deploy</code>: the private key is a real
          credential, so it's a <strong>secret</strong> (<code>OVH_SSH_PRIVATE_KEY</code>); the host
          and deploy username aren't sensitive, just configuration, so they're repo{' '}
          <strong>variables</strong> (<code>OVH_HOST</code>, <code>OVH_SSH_USER</code>). Generating
          the deploy keypair and pushing its private half into the GitHub secret follows{' '}
          <Link to="/markers/no-secrets-in-session">no-secrets-in-session</Link>: piped straight
          into <code>gh secret set</code>, never displayed - only the resulting public key (not a
          secret) needs to be shown or handed anywhere.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Verified against Avantra's real <code>docs/production.md</code>, <code>package.json</code>,
          and <code>.github/workflows/deploy.yml</code>; the Windows commands below are the exact
          gotchas hit live while standing up Bizfront's second VPS the same way.
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'package.json - the two identities, never confused for one another (Avantra)',
              language: 'json',
              code: `{
  "scripts": {
    "vps": "ssh -o IdentitiesOnly=yes -i \\"%USERPROFILE%\\\\.ssh\\\\avantra_ovh\\" ubuntu@40.160.84.132",
    "vps:deploy": "ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i %USERPROFILE%\\\\.ssh\\\\avantra_github_deploy deploy@40.160.84.132"
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: '.github/workflows/deploy.yml - gated on config, deploy-key-only SSH',
              language: 'yaml',
              code: `if: \${{ vars.OVH_HOST != '' && vars.OVH_SSH_USER != '' && vars.AVANTRA_DOMAIN != '' }}
...
- name: Configure SSH
  env:
    DEPLOY_KEY: \${{ secrets.OVH_SSH_PRIVATE_KEY }}
    OVH_HOST: \${{ vars.OVH_HOST }}
  run: |
    install -d -m 700 ~/.ssh
    printf '%s\\n' "$DEPLOY_KEY" > ~/.ssh/id_ed25519
    chmod 600 ~/.ssh/id_ed25519
    ssh-keyscan -H "$OVH_HOST" >> ~/.ssh/known_hosts`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Windows OpenSSH gotchas hit live setting up Bizfront’s VPS',
              language: 'powershell',
              code: `# 1) PowerShell does not expand "~" before handing an argument to ssh-keygen.exe - it
# arrives literally, so ssh-keygen tries (and fails) to write inside a folder named "~".
# Use $env:USERPROFILE explicitly instead.
ssh-keygen -t ed25519 -C "bizfront-ovh-admin" -f "$env:USERPROFILE\\.ssh\\bizfront_ovh"

# 2) The deploy identity's passphrase is empty by design - it has to run non-interactively
# in CI. -N '""' is the PowerShell-safe way to pass an empty string to ssh-keygen.exe.
ssh-keygen -t ed25519 -C "bizfront-github-deploy" -f "$env:USERPROFILE\\.ssh\\bizfront_github_deploy" -N '""'

# 3) ssh-copy-id doesn't ship with Windows' OpenSSH client. Pipe the public key in and
# append it on the remote side instead - what's piped here is the public key, not a secret.
Get-Content "$env:USERPROFILE\\.ssh\\bizfront_ovh.pub" | ssh ubuntu@15.204.229.68 \\
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"`,
            }}
          />
        </div>
      </section>

      <section className="marker-page-section">
        <h2>Outside of code</h2>
        <p>These steps happen on the VPS itself or in GitHub settings, not in the repo:</p>
        <ul>
          <li>
            Order the VPS from OVH; the initial login uses an OVH-issued temporary password for the{' '}
            <code>ubuntu</code> user and forces a password change on first connect (
            <code>ssh ubuntu@&lt;ip&gt;</code>) - do this before generating the personal admin key
            above, since installing that key still needs one password-authenticated login first.
          </li>
          <li>
            As <code>ubuntu</code>, with the personal admin key: install Docker + Docker Compose,
            create the non-root <code>deploy</code> user, and add it to the <code>docker</code>{' '}
            group. This is a root-only step and stays the account holder's alone - the agent's first
            connection to the box is verifying the freshly created <code>deploy</code> account, never
            the provisioning that creates it.
          </li>
          <li>
            Set <code>OVH_SSH_PRIVATE_KEY</code> as a GitHub Actions secret and{' '}
            <code>OVH_HOST</code> / <code>OVH_SSH_USER</code> as repo variables, once the deploy
            key's public half is installed on the box and a plain{' '}
            <code>ssh -o BatchMode=yes ... deploy@&lt;ip&gt;</code> confirms it logs in with no
            password fallback.
          </li>
          <li>
            Decide explicitly whether to leave SSH password login enabled on the VPS once both keys
            exist, or disable it - Avantra kept it enabled by a deliberate product-owner decision,
            not by default, and that choice is worth making freshly each time rather than copying
            forward automatically.
          </li>
        </ul>
      </section>
    </article>
  )
}
