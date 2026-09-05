import type { ComponentType } from 'react'
import * as techStack from './tech-stack'
import * as myaspDeploy from './myasp-deploy'
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
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [
  techStack,
  myaspDeploy,
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
]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
