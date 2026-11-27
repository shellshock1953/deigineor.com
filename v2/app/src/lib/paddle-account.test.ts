import assert from 'node:assert/strict'
import { createHmac } from 'node:crypto'
import { test } from 'node:test'

import { signToken } from './account'
import { resolvePaddlePrice } from './paddle'
import { paddleAccounts, pickPaddleAccount, sandboxBuyer } from './paddle-account'

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

test('sandbox purchase is bound to a signed-in tester through the checkout proof', () => {
  process.env.PAYLOAD_SECRET = 'test-secret'
  const ev = (tester?: string) => ({ event_type: 'transaction.completed', occurred_at: '', data: { custom_data: tester ? { tester } : null } })
  const on = (_f: string, email: string) => email === 't@x.co'
  assert.equal(sandboxBuyer(ev(signToken('checkout', 'T@x.co')), on), 't@x.co')
  assert.equal(sandboxBuyer(ev(), on), null) // typed email only, no proof
  assert.equal(sandboxBuyer(ev(signToken('session', 't@x.co')), on), null) // wrong purpose
  assert.equal(sandboxBuyer(ev(signToken('checkout', 'u@x.co')), on), null) // not a tester
  assert.equal(sandboxBuyer(ev('garbage'), on), null)
})

test('resolvePaddlePrice computes base price and active checkout discount', () => {
  const rawPrice = {
    id: 'pri_1',
    product_id: 'pro_1',
    status: 'active',
    unit_price: { amount: '9900', currency_code: 'USD' },
  }
  assert.deepEqual(resolvePaddlePrice(rawPrice, []), { price: 99, currency: 'USD' })

  const pct = {
    id: 'dsc_10',
    status: 'active',
    enabled_for_checkout: true,
    type: 'percentage' as const,
    amount: '10',
    restrict_to: ['pri_1'],
  }
  assert.deepEqual(resolvePaddlePrice(rawPrice, [pct]), {
    price: 89.1,
    currency: 'USD',
    originalPrice: 99,
    discountId: 'dsc_10',
    discountPercent: 10,
  })

  // Disabled for checkout or restricted to another price is ignored.
  assert.deepEqual(
    resolvePaddlePrice(rawPrice, [
      { ...pct, enabled_for_checkout: false },
      { ...pct, restrict_to: ['pri_other'] },
    ]),
    { price: 99, currency: 'USD' },
  )
})
