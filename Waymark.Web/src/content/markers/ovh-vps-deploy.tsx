import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'ovh-vps-deploy',
  title: 'OVH VPS: Docker Compose + Caddy, with a two-tier SSH boundary',
  category: 'Deployment',
  summary:
    'A project that genuinely needs full container control - a private background worker, arbitrary Docker services, self-service TLS/subdomain automation - runs on an OVH VPS instead of myasp.net, with a fixed architecture and an SSH access split that keeps CI and an agent structurally unable to reach root.',
  tags: ['ovh', 'vps', 'ssh', 'docker', 'caddy', 'deployment', 'github-actions'],
  isIllustrative: false,
}

export default function OvhVpsDeployPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Standing up a second VPS-hosted project means re-deciding, from scratch, both the
          container architecture and which SSH identity is allowed to do what - easy to get wrong,
          since a root-capable key is technically just as usable for routine work as an unprivileged
          one unless something says otherwise.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          Unlike myasp.net's shared hosting (see <Link to="/markers/myasp-deploy">myasp-deploy</Link>),
          a VPS hands out a root-capable account, and nothing about SSH itself enforces which
          identity a human, CI, or an agent is supposed to use - that has to be a stated policy, not
          an assumption about what's technically reachable in a shell.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Reach for a VPS only when myasp.net truly cannot do the job - not as a default and not as
          an upgrade. Two real cases so far: Avantra (a private Python/Playwright browser-automation
          worker needing real CDP/Chromium access, which no shared host allows) and Bizfront
          (self-service per-tenant subdomains and wildcard TLS via DNS-01, which myasp.net/
          SmarterASP.NET has no API for at all). Every other project in this workspace stays on
          myasp.net.
        </p>
        <p>
          <strong>Architecture:</strong> one Ubuntu 24.04 OVH VPS, Docker Compose, Caddy as the only
          service with published ports (80/443) - it reverse-proxies to every other container over
          the private Docker network and handles TLS automatically. Nothing else is ever bound to a
          host port directly; a database, for instance, is reachable only from other containers or
          via <code>docker compose exec</code> (see{' '}
          <Link to="/markers/postgres-docker">postgres-docker</Link> for the same private-by-default
          instinct applied to a connection string). Reuse the exact image versions in the Code
          section below - already verified working together in Avantra's real stack - rather than
          re-picking versions per project.
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
            never the identity CI or an agent use, regardless of what's loaded in a local{' '}
            <code>ssh-agent</code> for the human's own convenience.
          </li>
          <li>
            A second key with an <strong>empty passphrase</strong>, for a dedicated non-root{' '}
            <code>deploy</code> user in the <code>docker</code> group only - not <code>sudo</code>.
            This is the only identity GitHub Actions or an agent ever use, always with{' '}
            <code>BatchMode=yes</code> so it can never fall back to an interactive password prompt.
            It can run <code>docker compose</code> against the live stack, but it structurally
            cannot become root.
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
          Build and actually run every image against a real dependency before trusting it, not just
          read the Dockerfile - the same lesson Avantra's own <code>worker.Dockerfile</code> comment
          records for a missing <code>COPY</code>, generalized: a <code>.dockerignore</code> that
          doesn't mirror <code>.gitignore</code>'s local-runtime-state exclusions lets a gitignored,
          on-disk-only directory (invisible to <code>git status</code>) get copied into the build
          context and published straight into the image. If that directory is a CMS's own local
          data/state folder, the app can boot, pass a naive health check, and still be silently
          running on leftover local data instead of the real database - worth an explicit
          build-and-run check against a real dependency, since nothing about a successful build
          alone would ever catch it.
        </p>
        <p>
          Same secret-vs-variable split as <code>myasp-deploy</code>: the private key is a real
          credential, so it's a <strong>secret</strong> (<code>OVH_SSH_PRIVATE_KEY</code>); the host
          and deploy username aren't sensitive, just configuration, so they're repo{' '}
          <strong>variables</strong> (<code>OVH_HOST</code>, <code>OVH_SSH_USER</code>). Generate the
          deploy keypair and push its private half into the GitHub secret per{' '}
          <Link to="/markers/no-secrets-in-session">no-secrets-in-session</Link> - piped straight
          into <code>gh secret set</code>, never displayed; only the resulting public key (not a
          secret) needs to be shown or handed anywhere.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Verified against Avantra's real production stack.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: 'Image versions in production, by service',
              language: 'text',
              code: `Host OS          Ubuntu 24.04 (OVH)
Reverse proxy    caddy:2.10-alpine
Database         postgres:17
.NET runtime     mcr.microsoft.com/dotnet/aspnet:10.0   (build: .../sdk:10.0)
Frontend build   node:22-bookworm-slim                  (build stage only, output copied into the .NET image)
Python worker    mcr.microsoft.com/playwright/python:v1.58.0-noble   (only if a project needs one)`,
            }}
          />
          <CodeBlock
            example={{
              label: 'compose.production.yaml - shape (trimmed to the reusable parts, from Avantra)',
              language: 'yaml',
              code: `services:
  postgres:
    image: postgres:17
    restart: unless-stopped
    environment:
      POSTGRES_DB: myapp
      POSTGRES_USER: myapp
      POSTGRES_PASSWORD: \${MYAPP_POSTGRES_PASSWORD}
    volumes: ["postgres-data:/var/lib/postgresql/data"]
    # No "ports:" - reachable only from other containers, never the host.
  caddy:
    image: caddy:2.10-alpine
    restart: unless-stopped
    environment:
      MYAPP_DOMAIN: \${MYAPP_DOMAIN}
    ports: ["80:80", "443:443"]
    volumes: ["./deploy/Caddyfile:/etc/caddy/Caddyfile:ro", "caddy-data:/data", "caddy-config:/config"]
    depends_on: { api: { condition: service_healthy } }
  api:
    build: { context: ., dockerfile: deploy/api.Dockerfile }
    restart: unless-stopped
    environment:
      ConnectionStrings__MyApp: Host=postgres;Database=myapp;Username=myapp;Password=\${MYAPP_POSTGRES_PASSWORD}
    depends_on: { postgres: { condition: service_healthy } }
volumes:
  postgres-data:
  caddy-data:
  caddy-config:`,
            }}
          />
          <CodeBlock
            example={{
              label: 'deploy/api.Dockerfile - build the frontend, publish the API on top of it',
              language: 'dockerfile',
              code: `FROM node:22-bookworm-slim AS web-build
WORKDIR /src/MyApp.Web
COPY MyApp.Web/package*.json ./
RUN npm ci
COPY MyApp.Web/ ./
RUN npm run build

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS api-build
WORKDIR /src
COPY MyApp.Api/MyApp.Api.csproj MyApp.Api/
RUN dotnet restore MyApp.Api/MyApp.Api.csproj
COPY MyApp.Api/ MyApp.Api/
RUN dotnet publish MyApp.Api/MyApp.Api.csproj --no-restore -c Release -o /out
COPY --from=web-build /src/MyApp.Web/dist/ /out/wwwroot/

FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=api-build /out/ ./
ENV ASPNETCORE_URLS=http://+:8080 ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080
ENTRYPOINT ["dotnet", "MyApp.Api.dll"]`,
            }}
          />
          <CodeBlock
            example={{
              label: 'deploy/Caddyfile',
              language: 'text',
              code: `{$MYAPP_DOMAIN} {
    encode zstd gzip
    reverse_proxy api:8080
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'package.json - the two identities, never confused for one another',
              language: 'json',
              code: `{
  "scripts": {
    "vps": "ssh -o IdentitiesOnly=yes -i \\"%USERPROFILE%\\\\.ssh\\\\myapp_ovh\\" ubuntu@<vps-ip>",
    "vps:deploy": "ssh -o BatchMode=yes -o ConnectTimeout=10 -o IdentitiesOnly=yes -i %USERPROFILE%\\\\.ssh\\\\myapp_github_deploy deploy@<vps-ip>"
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: '.github/workflows/deploy.yml - gated on config, deploy-key-only SSH',
              language: 'yaml',
              code: `if: \${{ vars.OVH_HOST != '' && vars.OVH_SSH_USER != '' && vars.MYAPP_DOMAIN != '' }}
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
              label: 'Generating the two keys on Windows - two fixes not needed on macOS/Linux',
              language: 'powershell',
              code: `# PowerShell does not expand "~" before handing an argument to ssh-keygen.exe - it
# arrives literally, so ssh-keygen tries (and fails) to write inside a folder named "~".
# Use $env:USERPROFILE explicitly instead.
ssh-keygen -t ed25519 -C "myapp-ovh-admin" -f "$env:USERPROFILE\\.ssh\\myapp_ovh"

# Deploy identity: empty passphrase by design, so CI can use it non-interactively.
# -N '""' is the PowerShell-safe way to pass an empty string to ssh-keygen.exe.
ssh-keygen -t ed25519 -C "myapp-github-deploy" -f "$env:USERPROFILE\\.ssh\\myapp_github_deploy" -N '""'

# ssh-copy-id doesn't ship with Windows' OpenSSH client. Pipe the public key in and
# append it on the remote side instead - what's piped here is the public key, not a secret.
Get-Content "$env:USERPROFILE\\.ssh\\myapp_ovh.pub" | ssh ubuntu@<vps-ip> \\
  "mkdir -p ~/.ssh && chmod 700 ~/.ssh && cat >> ~/.ssh/authorized_keys && chmod 600 ~/.ssh/authorized_keys"`,
            }}
          />
        </div>
      </section>

      <section className="marker-page-section">
        <h2>Outside of code</h2>
        <p>These steps happen on the VPS itself, in DNS, or in GitHub settings, not in the repo:</p>
        <ul>
          <li>
            Order the VPS from OVH; the initial login uses an OVH-issued temporary password for the{' '}
            <code>ubuntu</code> user and forces a password change on first connect.
          </li>
          <li>
            As <code>ubuntu</code>, with the personal admin key: install Docker + Docker Compose,
            create the non-root <code>deploy</code> user, and add it to the <code>docker</code>{' '}
            group - a root-only step that stays the account holder's alone.
          </li>
          <li>
            Set <code>OVH_SSH_PRIVATE_KEY</code> as a GitHub Actions secret and{' '}
            <code>OVH_HOST</code> / <code>OVH_SSH_USER</code> as repo variables, once the deploy
            key's public half is installed and a plain{' '}
            <code>ssh -o BatchMode=yes ... deploy@&lt;ip&gt;</code> confirms it logs in with no
            password fallback.
          </li>
          <li>
            DNS: the apex domain needs a normal <code>A</code> record to the VPS's IP; a{' '}
            <code>www</code> subdomain should be a <code>CNAME</code> to the apex rather than a
            second <code>A</code> record, so the IP only needs updating in one place if it ever
            changes - DNS forbids a CNAME at the apex itself, but nothing stops <code>www</code>{' '}
            from following it.
          </li>
          <li>
            Decide explicitly whether to leave SSH password login enabled on the VPS once both keys
            exist, or disable it - Avantra kept it enabled by a deliberate product-owner decision,
            not by default, and that choice is worth making freshly each time.
          </li>
        </ul>
      </section>
    </article>
  )
}
