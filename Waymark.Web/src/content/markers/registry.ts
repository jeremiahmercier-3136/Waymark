import type { ComponentType } from 'react'
import * as techStack from './tech-stack'
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [techStack]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
