import { getPayload } from 'payload'
import config from '@payload-config'

import { issueLicense, revocationFor, type PaddleEvent } from '../../../../lib/license/issue.mjs'
import { addRevocation } from '../../../../lib/license/revocations'
import { verifyPaddleSignature } from '../../../../lib/license/signature'

export const dynamic = 'force-dynamic'

const ENTITLEMENT = 'librarium-studio'

// Paddle Billing webhook. Non-2xx makes Paddle retry, so transient failures (Paddle API, DB) return 5xx.
export async function POST(request: Request) {
  const e = process.env
  const secret = e.PADDLE_WEBHOOK_SECRET
  const apiKey = e.PADDLE_API_KEY
  const signingKey = e.LICENSE_SIGNING_KEY
  if (!secret || !apiKey || !signingKey) {
    console.error('paddle webhook: PADDLE_WEBHOOK_SECRET, PADDLE_API_KEY and LICENSE_SIGNING_KEY must all be set')
    return new Response(null, { status: 503 })
  }

  // The signature covers the exact bytes: read the text first, parse after.
  const raw = await request.text()
  if (!verifyPaddleSignature(request.headers.get('paddle-signature'), raw, secret)) {
    return new Response(null, { status: 401 })
  }
  let event: PaddleEvent
  try {
    event = JSON.parse(raw)
  } catch {
    return new Response(null, { status: 400 })
  }

  const payload = await getPayload({ config })

  if (event.event_type === 'transaction.completed') {
    // shortcut: any completed transaction gets a Librarium Studio licence (one paid product today); match items to a price id before a second product goes on sale
    const txn = String(event.data.id)
    const base = e.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production-api' : 'sandbox-api'
    const res = await fetch(`https://${base}.paddle.com/customers/${encodeURIComponent(event.data.customer_id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      console.error(`paddle webhook: customer lookup for ${txn} failed: ${res.status}`)
      return new Response(null, { status: 502 })
    }
    const customer = await res.json()
    const licence = issueLicense(signingKey, event, customer, ENTITLEMENT)
    const data = {
      txn,
      product: ENTITLEMENT,
      name: customer.data.name,
      email: customer.data.email,
      licence,
      status: 'active' as const,
      paddleCustomerId: event.data.customer_id,
    }
    // Replays are idempotent: the same txn keeps its row (and its status, a refund must not be undone).
    const found = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
    if (!found.docs.length) await payload.create({ collection: 'licenses', data })
  } else if (event.event_type === 'adjustment.created' || event.event_type === 'adjustment.updated') {
    const txn = revocationFor(event)
    if (txn) {
      await addRevocation(payload, signingKey, {
        txn,
        action: event.data.action,
        adj: event.data.id,
        at: event.occurred_at,
      })
      await payload.update({ collection: 'licenses', where: { txn: { equals: txn } }, data: { status: 'revoked' } })
    }
  }
  return new Response(null, { status: 200 })
}
