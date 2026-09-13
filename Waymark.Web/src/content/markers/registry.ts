import type { ComponentType } from 'react'
import * as techStack from './tech-stack'
import * as myaspDeploy from './myasp-deploy'
import * as ovhVpsDeploy from './ovh-vps-deploy'
import * as deployPathFilters from './deploy-path-filters'
import * as devScripts from './dev-scripts'
import * as postgresDocker from './postgres-docker'
import * as spaCacheBusting from './spa-cache-busting'
import * as unitTesting from './unit-testing'
import * as tddAfterPoc from './tdd-after-poc'
import * as selfReview from './self-review'
import * as prodTroubleshooting from './prod-troubleshooting'
import * as atlantisProjects from './atlantis-projects'
import * as autoEfMigrations from './auto-ef-migrations'
import * as noCommittedSecrets from './no-committed-secrets'
import * as noSecretsInSession from './no-secrets-in-session'
import * as namingConventions from './naming-conventions'
import * as faviconHeaderLogo from './favicon-header-logo'
import * as waymarkReference from './waymark-reference'
import * as readmeProductionUrl from './readme-production-url'
import * as jwtCookieAuth from './jwt-cookie-auth'
import * as issuesDocRedGreen from './issues-doc-red-green'
import * as productOverviewDoc from './product-overview-doc'
import * as slidingSessionRefresh from './sliding-session-refresh'
import * as reuseFirst from './reuse-first'
import * as consistentTheme from './consistent-theme'
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [
  techStack,
  myaspDeploy,
  ovhVpsDeploy,
  deployPathFilters,
  devScripts,
  postgresDocker,
  spaCacheBusting,
  unitTesting,
  tddAfterPoc,
  selfReview,
  prodTroubleshooting,
  atlantisProjects,
  autoEfMigrations,
  noCommittedSecrets,
  noSecretsInSession,
  namingConventions,
  faviconHeaderLogo,
  waymarkReference,
  readmeProductionUrl,
  jwtCookieAuth,
  issuesDocRedGreen,
  productOverviewDoc,
  slidingSessionRefresh,
  reuseFirst,
  consistentTheme,
]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
