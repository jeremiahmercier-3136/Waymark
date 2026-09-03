import type { ComponentType } from 'react'
import * as techStack from './tech-stack'
import * as myaspDeploy from './myasp-deploy'
import * as devScripts from './dev-scripts'
import * as postgresDocker from './postgres-docker'
import * as spaCacheBusting from './spa-cache-busting'
import * as unitTesting from './unit-testing'
import * as tddAfterPoc from './tdd-after-poc'
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [
  techStack,
  myaspDeploy,
  devScripts,
  postgresDocker,
  spaCacheBusting,
  unitTesting,
  tddAfterPoc,
]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
