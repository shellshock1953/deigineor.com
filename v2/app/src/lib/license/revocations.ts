import type { Payload } from 'payload'

import { revocationList, type RevokedEntry } from './issue.mjs'
import { mergeTesterRevocations } from '../testers'

const SLUG = 'license-revocations' as const

type Stored = { json: string; issuedAt: string; entries: RevokedEntry[] }

function parse(json: string): Stored {
  const p = JSON.parse(JSON.parse(json).payload) as { issued_at: string; revoked: RevokedEntry[] }
  return { json, issuedAt: p.issued_at, entries: p.revoked }
}

// shortcut: in-process lock, valid while replicas: 1; move to a pg advisory lock before scaling
// On globalThis like the Unleash client: Next may load this module once per route bundle.
type LockGlobal = typeof globalThis & { __deigineorRevocationsLock?: Promise<unknown> }
const lg = globalThis as LockGlobal
function locked<T>(fn: () => Promise<T>): Promise<T> {
  const run = (lg.__deigineorRevocationsLock ?? Promise.resolve()).then(fn)
  lg.__deigineorRevocationsLock = run.catch(() => {})
  return run
}

/** `issued_at` must be strictly newer than the stored list (the plugin only installs newer lists). */
const nextIssuedAt = (cur: Stored | null) => new Date(Math.max(Date.now(), cur ? Date.parse(cur.issuedAt) + 1 : 0)).toISOString()

async function read(payload: Payload): Promise<Stored | null> {
  const g = await payload.findGlobal({ slug: SLUG })
  return g.revokedJson ? parse(g.revokedJson) : null
}

/** The stored signed list; the first call (nothing stored yet) signs and stores an empty one. */
export async function getRevokedJson(payload: Payload, seedHex: string | undefined): Promise<string | null> {
  const cur = await read(payload)
  if (cur) return cur.json
  if (!seedHex) return null
  return locked(async () => {
    const again = await read(payload) // another request may have stored it while we waited
    if (again) return again.json
    const json = revocationList(seedHex, new Date().toISOString(), [])
    await payload.updateGlobal({ slug: SLUG, data: { revokedJson: json } })
    return json
  })
}

/** Returns true if `txn` is already in the stored revocation list. */
export async function isRevoked(payload: Payload, txn: string): Promise<boolean> {
  const cur = await read(payload)
  return cur?.entries.some((e) => e.txn === txn) ?? false
}

/** Adds an entry and re-signs with a strictly newer `issued_at`. */
export function addRevocation(payload: Payload, seedHex: string, entry: RevokedEntry): Promise<void> {
  return locked(async () => {
    const cur = await read(payload)
    if (cur?.entries.some((e) => e.txn === entry.txn)) return
    const json = revocationList(seedHex, nextIssuedAt(cur), [...(cur?.entries ?? []), entry])
    await payload.updateGlobal({ slug: SLUG, data: { revokedJson: json } })
  })
}

/** Brings the `txn_dev*` entries in line with `desired` (tester flags); re-signs only when they differ. Returns the current JSON. */
export async function syncTesterRevocations(payload: Payload, seedHex: string, desired: RevokedEntry[]): Promise<string | null> {
  const quick = await read(payload) // unlocked fast path: nothing to change, no need to queue behind a writer
  if (!quick) return null
  if (!mergeTesterRevocations(quick.entries, desired)) return quick.json
  return locked(async () => {
    const cur = await read(payload)
    if (!cur) return null
    const entries = mergeTesterRevocations(cur.entries, desired)
    if (!entries) return cur.json
    const json = revocationList(seedHex, nextIssuedAt(cur), entries)
    await payload.updateGlobal({ slug: SLUG, data: { revokedJson: json } })
    return json
  })
}
