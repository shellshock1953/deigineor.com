export type Os = 'windows' | 'macos' | 'linux'
export const OSES = ['windows', 'macos', 'linux'] as const
export const OS_NAME: Record<Os, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' }
export type Asset = { id: number; name: string }
export type Release = { tag_name: string; published_at: string; draft: boolean; prerelease: boolean; assets: Asset[] }
export type Latest = { version: string; published: string; assets: Partial<Record<Os, number>>; player: Partial<Record<Os, number>> }

const REPO = 'deigineor/VST-DEV'
const TAG = /^librarium-v(\d+)\.(\d+)\.(\d+)$/
const TTL_MS = 5 * 60_000
const MAX_PAGES = 5

const semver = (tag: string) => TAG.exec(tag)!.slice(1).map(Number)

/** Published `librarium-vX.Y.Z` releases, newest version first; other plugins' tags, drafts and prereleases are ignored. */
export function pickReleases(releases: Release[]): Release[] {
  const ok = releases.filter((r) => !r.draft && !r.prerelease && TAG.test(r.tag_name))
  return ok.sort((a, b) => {
    const [x, y] = [semver(a.tag_name), semver(b.tag_name)]
    return (y[0] - x[0]) || (y[1] - x[1]) || (y[2] - x[2])
  })
}

export const pickRelease = (releases: Release[]): Release | null => pickReleases(releases)[0] ?? null

/** Zip of one product for one OS: Studio by default (`LibrariumPlayer-*` and anything else never matches it). */
export function pickAsset(release: Release, os: Os, version: string, product = 'Librarium'): Asset | null {
  const want = `${product}-${version}-${OS_NAME[os]}-VST3.zip`
  return release.assets.find((a) => a.name === want) ?? null
}

export function toLatest(release: Release): Latest {
  const version = release.tag_name.replace(/^librarium-v/, '')
  const assets: Latest['assets'] = {}
  const player: Latest['player'] = {}
  for (const os of OSES) {
    const a = pickAsset(release, os, version)
    if (a) assets[os] = a.id
    const p = pickAsset(release, os, version, 'LibrariumPlayer')
    if (p) player[os] = p.id
  }
  return { version, published: release.published_at, assets, player }
}

const headers = (token: string, accept: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: accept,
  'X-GitHub-Api-Version': '2022-11-28',
})

// shortcut: per-process cache, so each pod looks the releases up once per 5 min; fine at this traffic
let cache: { at: number; list: Latest[] } | null = null

/** All published releases, newest first (one cached GitHub lookup). */
export async function getReleases(token: string, now = Date.now()): Promise<Latest[]> {
  if (cache && now - cache.at < TTL_MS) return cache.list
  const all: Release[] = []
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, {
      headers: headers(token, 'application/vnd.github+json'),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`GitHub releases: ${res.status}`)
    const releases = (await res.json()) as Release[]
    all.push(...releases)
    if (releases.length < 100) break
  }
  const list = pickReleases(all).map(toLatest)
  if (list.length) cache = { at: now, list }
  return list
}

export async function getLatest(token: string, now = Date.now()): Promise<Latest | null> {
  return (await getReleases(token, now))[0] ?? null
}

/** The `version=X.Y.Z` query param of a download route: undefined when absent, null when malformed. */
export function versionParam(url: URL): string | null | undefined {
  const v = url.searchParams.get('version')
  return v === null ? undefined : /^\d+\.\d+\.\d+$/.test(v) ? v : null
}

/** The requested release (a version), or the latest; null when there is none. */
export async function getRelease(token: string, version?: string): Promise<Latest | null> {
  const list = await getReleases(token)
  return version ? (list.find((r) => r.version === version) ?? null) : (list[0] ?? null)
}

/** Short-lived signed URL of a private release asset (GitHub answers 302; we never proxy the bytes). */
export async function assetLocation(token: string, id: number): Promise<string | null> {
  const res = await fetch(`https://api.github.com/repos/${REPO}/releases/assets/${id}`, {
    headers: headers(token, 'application/octet-stream'),
    redirect: 'manual',
    cache: 'no-store',
  })
  return res.status === 302 ? res.headers.get('location') : null
}
