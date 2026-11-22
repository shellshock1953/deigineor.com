import assert from 'node:assert/strict'
import { test } from 'node:test'

import { signToken, verifyToken } from './account'

process.env.PAYLOAD_SECRET = 'test-secret'

test('round trip normalises the email', () => {
  assert.equal(verifyToken('login', signToken('login', '  Bob@Example.COM ')), 'bob@example.com')
  assert.equal(verifyToken('session', signToken('session', 'a@b.co')), 'a@b.co')
})

test('expired tokens are rejected', () => {
  const t = signToken('login', 'a@b.co', 0)
  assert.equal(verifyToken('login', t, 14 * 60 * 1000), 'a@b.co')
  assert.equal(verifyToken('login', t, 16 * 60 * 1000), null)
})

test('tampered email is rejected', () => {
  const [, sig] = signToken('session', 'a@b.co').split('.')
  const forged = Buffer.from(`session|evil@b.co|${Math.floor(Date.now() / 1000) + 999}`).toString('base64url')
  assert.equal(verifyToken('session', `${forged}.${sig}`), null)
})

test('a login token is not a session token', () => {
  assert.equal(verifyToken('session', signToken('login', 'a@b.co')), null)
})

test('garbage and a missing secret fail closed', () => {
  assert.equal(verifyToken('login', 'x'), null)
  assert.equal(verifyToken('login', undefined), null)
  const t = signToken('login', 'a@b.co')
  process.env.PAYLOAD_SECRET = 'other'
  assert.equal(verifyToken('login', t), null)
  delete process.env.PAYLOAD_SECRET
  assert.throws(() => signToken('login', 'a@b.co'))
  process.env.PAYLOAD_SECRET = 'test-secret'
})
