import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'myasp-deploy',
  title: 'Deploying to myasp.net',
  category: 'Deployment',
  summary:
    'Each new project hosted on myasp.net re-derives the same GitHub Actions deploy pipeline, secrets handling, and shared-app-pool setup unless it copies a previous one - inconsistently.',
  tags: ['myasp', 'deployment', 'github-actions', 'webdeploy', 'iis'],
  isIllustrative: false,
}

export default function MyaspDeployPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          Setting up deployment for a new myasp.net-hosted project means re-deriving the same
          GitHub Actions workflow from memory or copying an earlier project's, with no guarantee
          it's the current best version. Earlier projects managed production secrets as app pool
          environment variables on the myasp.net server itself, which meant logging into the
          control panel and editing them by hand every time a secret changed or a new project
          needed one.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          myasp.net hosts multiple sites in one shared IIS app pool, and it manages some
          configuration - the app pool's environment variables, the SSL certificate, the HTTP to
          HTTPS redirect, Web Deploy credentials - through its own control panel rather than
          through source control. None of that, or the GitHub Actions side of it, had been written
          down in one place, so each project's deploy setup drifted from the others.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Publish the API project (which also embeds the built web app, per{' '}
          <Link to="/markers/tech-stack">tech-stack</Link>) and deploy it with the{' '}
          <code>talunzhang/auto-web-deploy</code> GitHub Action, pinned to a commit SHA. The site
          name, server, and username are GitHub repo <strong>variables</strong>; the Web Deploy
          password is a repo <strong>secret</strong> - it's a credential, so it's never a variable,
          and it has to be typed in by hand in the repo settings since nothing should script
          capturing it. The server and username are account-level, not per-site, so they're the
          same across every project on this myasp.net account:{' '}
          <code>MYASP_WEBDEPLOY_SERVER=https://win8140.site4now.net:8172/</code> and{' '}
          <code>MYASP_WEBDEPLOY_USERNAME=jeremiahmercier-002</code>. Only{' '}
          <code>MYASP_WEBDEPLOY_SITE</code> and the password change per project.
        </p>
        <p>
          Settings that differ in production but aren't secret - log paths, public keys, self-ping
          URLs - live in a committed <code>appsettings.Production.json</code> right alongside{' '}
          <code>appsettings.json</code>, the normal ASP.NET Core way.
        </p>
        <p>
          Actual secrets (connection strings, API keys) go in as GitHub repo secrets, and a
          workflow step merges them into <code>publish/appsettings.Production.json</code> right
          before the deploy step - so the running app still just reads ordinary configuration, and
          rotating a secret means updating it in GitHub, not logging into the server. This
          replaced the app-pool-environment-variable approach going forward; new projects
          shouldn't add production secrets as app pool environment variables.
        </p>
        <p>
          Because the app pool is shared across sites, each API project sets{' '}
          <code>{'<AspNetCoreHostingModel>OutOfProcess</AspNetCoreHostingModel>'}</code> - in-process
          hosting expects to own the pool's worker process, which doesn't work when other sites
          share it.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">
          Taken from this workspace's myasp.net-deployed projects (not Avantra, which doesn't
          follow this pattern).
        </p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: '.github/workflows/deploy.yml - variables, secret, and deploy step',
              language: 'yaml',
              code: `jobs:
  build-and-deploy:
    runs-on: windows-latest
    environment: production
    env:
      MYASP_WEBDEPLOY_SITE: \${{ vars.MYASP_WEBDEPLOY_SITE }}
      MYASP_WEBDEPLOY_SERVER: \${{ vars.MYASP_WEBDEPLOY_SERVER }}
      MYASP_WEBDEPLOY_USERNAME: \${{ vars.MYASP_WEBDEPLOY_USERNAME }}
      MYASP_WEBDEPLOY_PASSWORD: \${{ secrets.MYASP_WEBDEPLOY_PASSWORD }}

    steps:
      - name: Publish combined site
        run: dotnet publish MyApp.Api/MyApp.Api.csproj --configuration Release --output publish

      - name: Deploy published site
        uses: talunzhang/auto-web-deploy@7a6de6c56d0d85241cdaea2e5375920e060dd4ee # v1.0.1
        with:
          website-name: \${{ env.MYASP_WEBDEPLOY_SITE }}
          server-computer-name: \${{ env.MYASP_WEBDEPLOY_SERVER }}
          server-username: \${{ env.MYASP_WEBDEPLOY_USERNAME }}
          server-password: \${{ env.MYASP_WEBDEPLOY_PASSWORD }}
          source-path: '\\publish\\'`,
            }}
          />
          <CodeBlock
            example={{
              label: 'Write production application settings (from Cadence, trimmed to the reusable shape)',
              language: 'powershell',
              code: `- name: Write production application settings
  env:
    CONNECTIONSTRINGS__MYAPP: \${{ secrets.CONNECTIONSTRINGS__MYAPP }}
  run: |
    $settingsPath = Join-Path $PWD 'publish/appsettings.Production.json'
    $settings = if (Test-Path $settingsPath) {
      Get-Content $settingsPath -Raw | ConvertFrom-Json -AsHashtable
    } else { @{} }
    $settings.ConnectionStrings = @{ MyApp = $env:CONNECTIONSTRINGS__MYAPP }
    [System.IO.File]::WriteAllText(
      $settingsPath,
      ($settings | ConvertTo-Json -Depth 5),
      [System.Text.UTF8Encoding]::new($false))
    # Cadence's real step adds WebPush and native-push credentials the same way -
    # one env var in, one field merged into the hashtable, per secret.`,
            }}
          />
          <CodeBlock
            example={{
              label: 'appsettings.Production.json - non-secret, committed (from ModelMosaic)',
              language: 'json',
              code: `{
  "Logging": {
    "File": { "RetentionDays": 14, "Directory": "App_Data/logs" }
  },
  "Operations": {
    "SignatureMaxAgeSeconds": 300
  },
  "Runpod": {
    "SelfPingUrl": "https://modelmosaic.cc/",
    "SelfPingIntervalMinutes": 10
  }
}`,
            }}
          />
          <CodeBlock
            example={{
              label: 'MyApp.Api.csproj - out-of-process hosting for the shared app pool',
              language: 'xml',
              code: `<PropertyGroup>
  <TargetFramework>net10.0</TargetFramework>
  <AspNetCoreHostingModel>OutOfProcess</AspNetCoreHostingModel>
</PropertyGroup>`,
            }}
          />
        </div>
      </section>

      <section className="marker-page-section">
        <h2>Outside of code</h2>
        <p>These steps happen in Namecheap and the myasp.net control panel, not in the repo:</p>
        <ul>
          <li>
            Point the domain's nameservers at myasp.net's nameservers, in Namecheap:{' '}
            <code>ns1.site4now.net</code>, <code>ns2.site4now.net</code>,{' '}
            <code>ns3.site4now.net</code>.
          </li>
          <li>Configure the SSL certificate for the site in the myasp.net panel.</li>
          <li>Enable Web Deploy for the site in the myasp.net panel, then copy the site name into
            the <code>MYASP_WEBDEPLOY_SITE</code> repo variable and the Web Deploy password into
            the <code>MYASP_WEBDEPLOY_PASSWORD</code> repo secret by hand - <code>MYASP_WEBDEPLOY_SERVER</code>{' '}
            and <code>MYASP_WEBDEPLOY_USERNAME</code> don't change per project, so they only need
            setting once each time a new repo is created.</li>
          <li>Turn on the HTTP → HTTPS redirect for the site in the myasp.net panel - it edits the
            deployed <code>web.config</code> for you, so there's nothing to maintain in source.</li>
        </ul>
      </section>
    </article>
  )
}
