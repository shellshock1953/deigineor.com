import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { test } from 'node:test'

import { issueLicense, revocationFor, revocationList } from './issue.mjs'
import { isRevoked } from './revocations'
import { verifyPaddleSignature } from './signature'

const fx = (f: string) => readFileSync(new URL(`./fixtures/${f}`, import.meta.url), 'utf8')
const json = (f: string) => JSON.parse(fx(f))

test('paddle signature: good, bad, stale', () => {
  const secret = 'pdl_ntfset_test'
  const body = '{"event_type":"transaction.completed"}'
  const now = Date.now()
  const ts = String(Math.floor(now / 1000))
  const h1 = (t: string, b = body) => createHmac('sha256', secret).update(`${t}:${b}`).digest('hex')

  assert.equal(verifyPaddleSignature(`ts=${ts};h1=${h1(ts)}`, body, secret, now), true)
  assert.equal(verifyPaddleSignature(`ts=${ts};h1=${'0'.repeat(64)};h1=${h1(ts)}`, body, secret, now), true) // rotation
  assert.equal(verifyPaddleSignature(`ts=${ts};h1=${h1(ts)}`, body + ' ', secret, now), false) // body changed
  assert.equal(verifyPaddleSignature(`ts=${ts};h1=${h1(ts)}`, body, 'other', now), false)
  assert.equal(verifyPaddleSignature(`ts=${ts};h1=zz`, body, secret, now), false)
  assert.equal(verifyPaddleSignature(null, body, secret, now), false)
  assert.equal(verifyPaddleSignature(`h1=${h1(ts)}`, body, secret, now), false)
  const old = String(Math.floor(now / 1000) - 301)
  assert.equal(verifyPaddleSignature(`ts=${old};h1=${h1(old)}`, body, secret, now), false) // stale
  const fresh = String(Math.floor(now / 1000) - 299)
  assert.equal(verifyPaddleSignature(`ts=${fresh};h1=${h1(fresh)}`, body, secret, now), true)
})

test('issueLicense on the VST-DEV demo fixtures equals the demo Librarium.lic', () => {
  const seed = fx('DEMO-ONLY-secret.key').trim()
  const lic = issueLicense(seed, json('paddle-transaction-completed.json'), json('paddle-customer.json'))
  assert.equal(lic, fx('Librarium.lic'))
})

test('refund revocation rules', () => {
  const txn = 'txn_01k0demo0librarium0studio00'
  assert.equal(revocationFor(json('paddle-adjustment-refund-approved.json')), txn) // adjustment.updated
  assert.equal(revocationFor(json('paddle-adjustment-chargeback-created.json')), txn) // adjustment.created
  assert.equal(revocationFor(json('paddle-adjustment-refund-partial.json')), null)
  assert.equal(revocationFor(json('paddle-adjustment-refund-pending.json')), null)
  assert.equal(revocationFor(json('paddle-transaction-completed.json')), null)
})

test('revocation list is signed JSON with the entries', () => {
  const seed = fx('DEMO-ONLY-secret.key').trim()
  const entries = [{ txn: 'txn_a', action: 'refund', adj: 'adj_a', at: '2026-11-17T05:55:00.000Z' }]
  const list = JSON.parse(revocationList(seed, '2026-11-17T06:00:00.000Z', entries))
  assert.equal(list.format, 'librarium-revoked')
  assert.deepEqual(JSON.parse(list.payload).revoked, entries)
  assert.match(list.signature, /^[0-9a-f]{128}$/)
})

test('isRevoked checks stored revocation list', async () => {
  const seed = fx('DEMO-ONLY-secret.key').trim()
  const revokedJson = revocationList(seed, '2026-11-17T06:00:00.000Z', [
    { txn: 'txn_revoked', action: 'refund', adj: 'adj_a', at: '2026-11-17T05:55:00.000Z' },
  ])
  const mockPayload = { findGlobal: async () => ({ revokedJson }) } as unknown as Parameters<typeof isRevoked>[0]
  assert.equal(await isRevoked(mockPayload, 'txn_revoked'), true)
  assert.equal(await isRevoked(mockPayload, 'txn_active'), false)

  const emptyPayload = { findGlobal: async () => ({}) } as unknown as Parameters<typeof isRevoked>[0]
  assert.equal(await isRevoked(emptyPayload, 'txn_revoked'), false)
})
