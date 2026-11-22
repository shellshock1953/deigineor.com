import { createHash } from 'node:crypto'
import type { Payload } from 'payload'

import { isEnabled } from './flags'
import { issueLicense, type RevokedEntry } from './license/issue.mjs'
import { PRODUCTS } from './products'

// Tester licences: real `licenses` rows (paddleCustomerId 'dev') whose visibility and status follow the Unleash flags
// `deigineor.own.<entitlement>` and `deigineor.revoked.<entitlement>` (both on only for the tester segment).
export const DEV = 'dev'

type Enabled = (flag: string, email?: string | null) => boolean
type Row = { email: string; product: string; status: 'active' | 'revoked'; paddleCustomerId?: string | null }

/** Stable id per (email, entitlement); matches `^txn_[0-9a-z]{1,64}$`. */
export function testerTxn(email: string, product: string): string {
  return `txn_${DEV}${createHash('sha256').update(`${email}|${product}`).digest('hex').slice(0, 24)}`
}

/** Real rows: the stored status. Tester rows: from the flags, `null` when the tester does not own the product. */
export function effectiveStatus(doc: Row, enabled: Enabled = isEnabled): 'active' | 'revoked' | null {
  if (doc.paddleCustomerId !== DEV) return doc.status
  if (!enabled(`deigineor.own.${doc.product}`, doc.email)) return null
  return enabled(`deigineor.revoked.${doc.product}`, doc.email) ? 'revoked' : 'active'
}

/** Entitlements this email owns through the `own.*` flags (empty for everyone but testers). */
export function ownedByFlag(email: string, enabled: Enabled = isEnabled): string[] {
  return Object.keys(PRODUCTS).filter((p) => enabled(`deigineor.own.${p}`, email))
}

/** Creates the tester rows that `own.*` says exist but are missing; returns the new docs. */
export async function ensureTesterLicences(payload: Payload, email: string, existingTxns: Set<string>) {
  const key = process.env.LICENSE_SIGNING_KEY
  if (!key) return []
  const created = []
  for (const product of ownedByFlag(email)) {
    const txn = testerTxn(email, product)
    if (existingTxns.has(txn)) continue
    const now = new Date().toISOString()
    const licence = issueLicense(
      key,
      { event_type: 'transaction.completed', occurred_at: now, data: { id: txn, status: 'completed', billed_at: now } },
      { data: { name: email, email } },
      product,
    )
    try {
      created.push(
        await payload.create({
          collection: 'licenses',
          data: { txn, product, name: email, email, licence, status: 'active', paddleCustomerId: DEV },
        }),
      )
    } catch (err) {
      // Concurrent request won the unique txn race, like the webhook.
      const raced = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
      if (!raced.docs.length) throw err
    }
  }
  return created
}

/** Revocation entries the tester rows ask for right now. */
export async function desiredTesterRevocations(payload: Payload): Promise<RevokedEntry[]> {
  const { docs } = await payload.find({
    collection: 'licenses',
    where: { paddleCustomerId: { equals: DEV } },
    limit: 1000,
    pagination: false,
    depth: 0,
  })
  const at = new Date().toISOString()
  return docs
    .filter((d) => effectiveStatus(d) === 'revoked')
    .map((d) => ({ txn: d.txn, action: DEV, adj: DEV, at }))
}

/** New `revoked` list for the signed file: real entries untouched, `txn_dev*` entries equal to `desired`; null when already equal. */
export function mergeTesterRevocations(current: RevokedEntry[], desired: RevokedEntry[]): RevokedEntry[] | null {
  const isDev = (e: RevokedEntry) => e.txn.startsWith(`txn_${DEV}`)
  const want = new Set(desired.map((e) => e.txn))
  const have = new Set(current.filter(isDev).map((e) => e.txn))
  if (want.size === have.size && [...want].every((t) => have.has(t))) return null
  const kept = current.filter((e) => !isDev(e) || want.has(e.txn))
  return [...kept, ...desired.filter((e) => !have.has(e.txn))]
}
