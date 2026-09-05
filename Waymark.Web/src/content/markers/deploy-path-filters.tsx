import { Link } from 'react-router-dom'
import { CodeBlock } from '../../components/CodeBlock'
import { MarkerPageHeader } from '../../components/MarkerPageHeader'
import type { MarkerMeta } from './types'

export const meta: MarkerMeta = {
  id: 'deploy-path-filters',
  title: 'Scope the deploy workflow so doc-only commits stop redeploying it',
  category: 'Deployment',
  summary:
    "A push-triggered deploy workflow with no path filter redeploys on every commit to main - a README typo fix rebuilds and republishes the exact same running software.",
  tags: ['github-actions', 'deployment', 'ci', 'myasp'],
  isIllustrative: false,
}

export default function DeployPathFiltersPage() {
  return (
    <article className="marker-page">
      <MarkerPageHeader meta={meta} />

      <section className="marker-page-section">
        <h2>Symptoms</h2>
        <p>
          A commit that only touches documentation - <code>README.md</code>,{' '}
          <code>AGENTS.md</code>, a comment - still kicks off the full deploy workflow: restore,
          test, publish, and a real Web Deploy push to myasp.net. The site that comes out the other
          end is byte-for-byte identical to what was already running; the only thing that happened
          is a few wasted minutes of Actions time and an unnecessary production deploy.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Root cause</h2>
        <p>
          <code>on: push: branches: [main]</code> with no <code>paths:</code> filter matches every
          commit to <code>main</code>, regardless of what it changed. Nothing about the trigger
          distinguishes a change to the running application from a change to a file the deployed
          app never even includes.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Resolution</h2>
        <p>
          Add a <code>paths:</code> allowlist under the push trigger, scoped to what actually
          affects the built/published output: the API and Web project folders, the test project,
          the solution file, the workflow file itself (so a workflow change can validate itself),
          and any shared build-config files (<code>Directory.Build.*</code>,{' '}
          <code>Directory.Packages.props</code>, <code>global.json</code>,{' '}
          <code>NuGet.config</code>) if the project uses them. Leave documentation, editor config,
          and anything outside the app off the list on purpose - that's the entire point of the
          filter.
        </p>
        <p>
          This was first added standalone in Cadence, then generalized across AtlantisTech,
          Avantra, MedServ, ModelMosaic, Runbook, and Virtual911 in the same
          "Optimize GitHub Actions usage" pass that also added <code>timeout-minutes</code> to the
          deploy job and pinned <code>talunzhang/auto-web-deploy</code> to a commit SHA - worth
          doing at the same time as adding a path filter to a new project, per{' '}
          <Link to="/markers/myasp-deploy">myasp-deploy</Link>, but a separate concern from the
          filter itself.
        </p>
      </section>

      <section className="marker-page-section">
        <h2>Code</h2>
        <p className="note">Taken from Cadence's deploy workflow.</p>
        <div className="code-examples">
          <CodeBlock
            example={{
              label: '.github/workflows/deploy.yml - scoped push trigger',
              language: 'yaml',
              code: `on:
  workflow_dispatch:
  push:
    branches:
      - main
    paths:
      - Cadence.Api/**
      - Cadence.Api.Tests/**
      - Cadence.Web/**
      - .github/workflows/deploy.yml
      - Directory.Build.*
      - Directory.Packages.props
      - global.json
      - NuGet.config`,
            }}
          />
        </div>
      </section>
    </article>
  )
}
