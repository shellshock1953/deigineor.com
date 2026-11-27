import assert from 'node:assert/strict'
import { test } from 'node:test'
import { isBogusServerAction, isEscapedMediaPath } from './proxy'
import { hostRoute } from './lib/store'

test('server action ids', () => {
  assert.equal(isBogusServerAction(null), false)
  assert.equal(isBogusServerAction('x'), true)
  assert.equal(isBogusServerAction(''), true)
  assert.equal(isBogusServerAction('a'.repeat(39)), true)
  assert.equal(isBogusServerAction('7f' + 'a1'.repeat(19) + 'B0'), false) // 42 hex chars
})

test('escaped media paths', () => {
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg\\'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg%5C'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg%5c'), true)
  assert.equal(isEscapedMediaPath('/api/media/file/peak-1200x630.jpg'), false)
  assert.equal(isEscapedMediaPath('/music/foo\\'), false)
})

const STORE = 'store.deigineor.com'
const MAIN = 'deigineor.com'
const toSite = { kind: 'redirect', origin: 'https://deigineor.com' }
const toStore = { kind: 'redirect', origin: 'https://store.deigineor.com' }
const next = { kind: 'next' }

test('store host serves only the shop', () => {
  assert.deepEqual(hostRoute(STORE, '/'), { kind: 'rewrite', path: '/store' })
  assert.deepEqual(hostRoute('Store.Deigineor.com:443', '/'), { kind: 'rewrite', path: '/store' })
  for (const p of ['/checkout', '/thanks', '/account', '/terms', '/privacy', '/refund', '/instruments/librarium-studio', '/api/paddle/webhook', '/api/media/file/a.jpg', '/librarium/revoked.json', '/_next/data/x.json', '/opengraph-image']) {
    assert.deepEqual(hostRoute(STORE, p), next, p)
  }
  for (const p of ['/music', '/music/x', '/game-audio', '/about', '/cv', '/instruments', '/instruments/a/b', '/admin', '/store', '/apix', '/accounts']) {
    assert.deepEqual(hostRoute(STORE, p), toSite, p)
  }
})

test('main host sends the shop to the store host', () => {
  for (const p of ['/checkout', '/thanks', '/account', '/account/x']) assert.deepEqual(hostRoute(MAIN, p), toStore, p)
  for (const p of ['/', '/music', '/instruments/x', '/api/paddle/webhook', '/api/account/login', '/accounting', '/admin']) {
    assert.deepEqual(hostRoute(MAIN, p), next, p)
  }
  assert.deepEqual(hostRoute(null, '/checkout'), toStore)
  assert.deepEqual(hostRoute('10.0.0.5:3000', '/healthz'), next)
})
