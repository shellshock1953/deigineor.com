import type { Payload } from 'payload'

import { revocationList, type RevokedEntry } from './issue.mjs'

const SLUG = 'license-revocations' as const

type Stored = { json: string; issuedAt: string; entries: RevokedEntry[] }

function parse(json: string): Stored {
  const p = JSON.parse(JSON.parse(json).payload) as { issued_at: string; revoked: RevokedEntry[] }
  return { json, issuedAt: p.issued_at, entries: p.revoked }
}

async function read(payload: Payload): Promise<Stored | null> {
  const g = await payload.findGlobal({ slug: SLUG })
  return g.revokedJson ? parse(g.revokedJson) : null
}

/** The stored signed list; the first call (nothing stored yet) signs and stores an empty one. */
export async function getRevokedJson(payload: Payload, seedHex: string | undefined): Promise<string | null> {
  const cur = await read(payload)
  if (cur) return cur.json
  if (!seedHex) return null
  const json = revocationList(seedHex, new Date().toISOString(), [])
  await payload.updateGlobal({ slug: SLUG, data: { revokedJson: json } })
  return json
}

/** Adds an entry and re-signs with a strictly newer `issued_at` (the plugin only installs newer lists). */
export async function addRevocation(payload: Payload, seedHex: string, entry: RevokedEntry): Promise<void> {
  const cur = await read(payload)
  if (cur?.entries.some((e) => e.txn === entry.txn)) return
  let issuedAt = new Date().toISOString()
  if (cur && issuedAt <= cur.issuedAt) issuedAt = new Date(Date.parse(cur.issuedAt) + 1).toISOString()
  // shortcut: read-modify-write without a lock, fine at refund volume; add a row lock if two refunds can land in the same ms
  const json = revocationList(seedHex, issuedAt, [...(cur?.entries ?? []), entry])
  await payload.updateGlobal({ slug: SLUG, data: { revokedJson: json } })
}
