import type { ComponentType } from 'react'
import * as techStack from './tech-stack'
import * as myaspDeploy from './myasp-deploy'
import * as devScripts from './dev-scripts'
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [techStack, myaspDeploy, devScripts]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
