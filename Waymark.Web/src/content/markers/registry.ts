import type { ComponentType } from 'react'
import * as stackDotnetReactViteNpm from './stack-dotnet-react-vite-npm'
import * as viteProxyColdStart404 from './vite-proxy-cold-start-404'
import * as webdeploySilentlySkips from './webdeploy-silently-skips'
import * as efCoreMigrationDrift from './ef-core-migration-drift'
import * as reactStateUpdateAfterUnmount from './react-state-update-after-unmount'
import * as actionsCacheKeyCollision from './actions-cache-key-collision'
import * as corsPreflightBlockedByAuthMiddleware from './cors-preflight-blocked-by-auth-middleware'
import type { MarkerMeta } from './types'

type MarkerModule = { meta: MarkerMeta; default: ComponentType }

const modules: MarkerModule[] = [
  stackDotnetReactViteNpm,
  viteProxyColdStart404,
  webdeploySilentlySkips,
  efCoreMigrationDrift,
  reactStateUpdateAfterUnmount,
  actionsCacheKeyCollision,
  corsPreflightBlockedByAuthMiddleware,
]

export const markers = modules.map((m) => ({ meta: m.meta, Component: m.default }))
