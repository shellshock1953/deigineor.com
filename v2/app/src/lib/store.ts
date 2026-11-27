import { headers } from 'next/headers'

import { SITE_URL, STORE_URL } from './email'

const hostOf = (host: string | null) => (host ?? '').split(':')[0].toLowerCase()

export const isStoreHostname = (host: string | null) => hostOf(host) === new URL(STORE_URL).hostname

/** True when the current request is for the store host. Server components and route handlers only. */
export async function isStoreRequest() {
  return isStoreHostname((await headers()).get('host'))
}

// Everything the store host serves; any other path goes to the main site.
const STORE_PATHS =
  /^\/(?:store|checkout|thanks|account|terms|privacy|refund|healthz|readyz|opengraph-image|instruments\/[^/]+|(?:api|librarium|_next)\/.*)?\/?$/
// Shop pages that must not live on the main host.
const MAIN_TO_STORE = /^\/(?:store|checkout|thanks|account)(?:\/|$)/

export type HostRoute =
  | { kind: 'next' }
  | { kind: 'rewrite'; path: string }
  | { kind: 'redirect'; origin: string }

export function hostRoute(host: string | null, pathname: string): HostRoute {
  if (isStoreHostname(host)) {
    if (pathname === '/') return { kind: 'rewrite', path: '/store' }
    return STORE_PATHS.test(pathname) ? { kind: 'next' } : { kind: 'redirect', origin: SITE_URL }
  }
  return MAIN_TO_STORE.test(pathname) ? { kind: 'redirect', origin: STORE_URL } : { kind: 'next' }
}
