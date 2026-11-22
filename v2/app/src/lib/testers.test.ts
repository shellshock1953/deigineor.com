import assert from 'node:assert/strict'
import { test } from 'node:test'

import type { RevokedEntry } from './license/issue.mjs'
import { effectiveStatus, mergeTesterRevocations, testerTxn } from './testers'

const flags = (on: string[]) => (name: string, email?: string | null) => on.includes(`${name}@${email}`)
const own = 'deigineor.own.librarium-studio@t@x.co'
const rev = 'deigineor.revoked.librarium-studio@t@x.co'
const row = (paddleCustomerId: string, status: 'active' | 'revoked' = 'active') =>
  ({ email: 't@x.co', product: 'librarium-studio', status, paddleCustomerId })

test('tester txn is stable, lower-case hex and passes the txn check', () => {
  const a = testerTxn('t@x.co', 'librarium-studio')
  assert.equal(a, testerTxn('t@x.co', 'librarium-studio'))
  assert.match(a, /^txn_dev[0-9a-f]{24}$/)
  assert.match(a, /^txn_[0-9a-z]{1,64}$/)
  assert.notEqual(a, testerTxn('t@x.co', 'other'))
  assert.notEqual(a, testerTxn('u@x.co', 'librarium-studio'))
})

test('effective status: real rows keep their stored status, tester rows follow the flags', () => {
  const none = flags([])
  assert.equal(effectiveStatus(row('ctm_1'), none), 'active')
  assert.equal(effectiveStatus(row('ctm_1', 'revoked'), flags([own, rev])), 'revoked')
  assert.equal(effectiveStatus(row('dev'), none), null)
  assert.equal(effectiveStatus(row('dev'), flags([rev])), null)
  assert.equal(effectiveStatus(row('dev'), flags([own])), 'active')
  assert.equal(effectiveStatus(row('dev'), flags([own, rev])), 'revoked')
})

test('revocation merge: add, remove, no-op', () => {
  const e = (txn: string): RevokedEntry => ({ txn, action: 'refund', adj: 'adj_1', at: 't' })
  const real = e('txn_real1')
  const dev = e('txn_dev111')
  assert.deepEqual(mergeTesterRevocations([real], [dev]), [real, dev])
  assert.deepEqual(mergeTesterRevocations([real, dev], []), [real])
  assert.equal(mergeTesterRevocations([real, dev], [e('txn_dev111')]), null)
  assert.equal(mergeTesterRevocations([real], []), null)
})
