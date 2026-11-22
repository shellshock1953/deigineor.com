import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'

import { paddleAccounts, pickPaddleAccount } from './paddle-account'

const now = 1_700_000_000_000
const body = '{"event_type":"transaction.completed"}'
const sign = (secret: string) => {
  const ts = String(now / 1000)
  return `ts=${ts};h1=${createHmac('sha256', secret).update(`${ts}:${body}`).digest('hex')}`
}
const env = {
  PADDLE_WEBHOOK_SECRET: 'main-secret',
  PADDLE_API_KEY: 'main-key',
  NEXT_PUBLIC_PADDLE_ENV: 'production',
  PADDLE_SANDBOX_WEBHOOK_SECRET: 'sb-secret',
  PADDLE_SANDBOX_API_KEY: 'sb-key',
}

test('picks the account whose secret signed the body', () => {
  const accounts = paddleAccounts(env)
  assert.deepEqual(pickPaddleAccount(accounts, sign('main-secret'), body, now), {
    secret: 'main-secret',
    apiKey: 'main-key',
    apiBase: 'api',
  })
  assert.equal(pickPaddleAccount(accounts, sign('sb-secret'), body, now)?.apiBase, 'sandbox-api')
  assert.equal(pickPaddleAccount(accounts, sign('sb-secret'), body, now)?.testersOnly, true)
  assert.equal(pickPaddleAccount(accounts, sign('sb-secret'), body, now)?.apiKey, 'sb-key')
})

test('rejects an unknown signature or missing header', () => {
  const accounts = paddleAccounts(env)
  assert.equal(pickPaddleAccount(accounts, sign('other'), body, now), undefined)
  assert.equal(pickPaddleAccount(accounts, null, body, now), undefined)
})

test('main account on a sandbox site uses the sandbox API; unset sandbox secrets add no account', () => {
  const accounts = paddleAccounts({ PADDLE_WEBHOOK_SECRET: 's', PADDLE_API_KEY: 'k' })
  assert.equal(accounts.length, 1)
  assert.equal(accounts[0].apiBase, 'sandbox-api')
  assert.equal(paddleAccounts({}).length, 0)
})
