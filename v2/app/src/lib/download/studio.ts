export type Os = 'windows' | 'macos' | 'linux'
const OS_NAME: Record<Os, string> = { windows: 'Windows', macos: 'macOS', linux: 'Linux' }
export type Asset = { id: number; name: string }
export type Release = { tag_name: string; draft: boolean; prerelease: boolean; assets: Asset[] }
export type Latest = { version: string; assets: Partial<Record<Os, number>> }

const REPO = 'deigineor/VST-DEV'
const TAG = /^librarium-v(\d+)\.(\d+)\.(\d+)$/
const TTL_MS = 5 * 60_000
const MAX_PAGES = 5

const semver = (tag: string) => TAG.exec(tag)!.slice(1).map(Number)

/** Newest published `librarium-vX.Y.Z` release by version; other plugins' tags, drafts and prereleases are ignored. */
export function pickRelease(releases: Release[]): Release | null {
  const ok = releases.filter((r) => !r.draft && !r.prerelease && TAG.test(r.tag_name))
  ok.sort((a, b) => {
    const [x, y] = [semver(a.tag_name), semver(b.tag_name)]
    return (y[0] - x[0]) || (y[1] - x[1]) || (y[2] - x[2])
  })
  return ok[0] ?? null
}

/** Studio zip for one OS; `LibrariumPlayer-*` and anything else never matches. */
export function pickAsset(release: Release, os: Os, version: string): Asset | null {
  const want = `Librarium-${version}-${OS_NAME[os]}-VST3.zip`
  return release.assets.find((a) => a.name === want) ?? null
}

export function toLatest(release: Release): Latest {
  const version = release.tag_name.replace(/^librarium-v/, '')
  const assets: Latest['assets'] = {}
  for (const os of ['windows', 'macos', 'linux'] as const) {
    const a = pickAsset(release, os, version)
    if (a) assets[os] = a.id
  }
  return { version, assets }
}

const headers = (token: string, accept: string) => ({
  Authorization: `Bearer ${token}`,
  Accept: accept,
  'X-GitHub-Api-Version': '2022-11-28',
})

// shortcut: per-process cache, so each pod looks the release up once per 5 min; fine at this traffic
let cache: { at: number; latest: Latest } | null = null

export async function getLatest(token: string, now = Date.now()): Promise<Latest | null> {
  if (cache && now - cache.at < TTL_MS) return cache.latest
  for (let page = 1; page <= MAX_PAGES; page++) {
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=100&page=${page}`, {
      headers: headers(token, 'application/vnd.github+json'),
      cache: 'no-store',
    })
    if (!res.ok) throw new Error(`GitHub releases: ${res.status}`)
    const releases = (await res.json()) as Release[]
    const release = pickRelease(releases)
    if (release) {
      cache = { at: now, latest: toLatest(release) }
      return cache.latest
    }
    if (releases.length < 100) break
  }
  return null
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
