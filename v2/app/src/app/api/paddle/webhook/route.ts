import { getPayload } from 'payload'
import config from '@payload-config'

import { issueLicense, revocationFor, type PaddleEvent } from '../../../../lib/license/issue.mjs'
import { addRevocation, isRevoked } from '../../../../lib/license/revocations'
import { verifyPaddleSignature } from '../../../../lib/license/signature'
import { sendEmail, SITE_URL } from '../../../../lib/email'

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
    // Replays are idempotent: the same txn keeps its row (and its status, a refund must not be undone).
    const existing = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
    if (existing.docs.length) return new Response(null, { status: 200 })

    const base = e.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'api' : 'sandbox-api'
    const res = await fetch(`https://${base}.paddle.com/customers/${encodeURIComponent(event.data.customer_id)}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    })
    if (!res.ok) {
      console.error(`paddle webhook: customer lookup for ${txn} failed: ${res.status}`)
      return new Response(null, { status: 502 })
    }
    const rawCustomer = await res.json()
    const name = rawCustomer.data.name || rawCustomer.data.email
    const customer = { ...rawCustomer, data: { ...rawCustomer.data, name } }
    const licence = issueLicense(signingKey, event, customer, ENTITLEMENT)
    const status = (await isRevoked(payload, txn)) ? ('revoked' as const) : ('active' as const)
    const email = String(customer.data.email).trim().toLowerCase()
    const data = {
      txn,
      product: ENTITLEMENT,
      name,
      email,
      licence,
      status,
      paddleCustomerId: event.data.customer_id,
    }
    let created = false
    try {
      await payload.create({ collection: 'licenses', data })
      created = true
    } catch (err) {
      // Concurrent duplicate delivery may race on the unique txn index.
      const raced = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
      if (!raced.docs.length) throw err
    }
    if (created) {
      const link = `${SITE_URL}/thanks?txn=${encodeURIComponent(txn)}`
      const accountLink = `${SITE_URL}/account`
      await sendEmail({
        to: email,
        subject: 'Your Librarium Studio licence',
        text: [
          'Thank you for buying Librarium Studio.',
          '',
          `Download your licence file and Librarium Studio at any time: ${link}`,
          'Keep this email: the link is your access.',
          '',
          `You can also sign in at ${accountLink} with this email address to see all your purchases.`,
        ].join('\n'),
        html: [
          '<p>Thank you for buying Librarium Studio.</p>',
          `<p>Download your licence file and Librarium Studio at any time: <a href="${link}">${link}</a></p>`,
          '<p>Keep this email: the link is your access.</p>',
          `<p>You can also sign in at <a href="${accountLink}">${accountLink}</a> with this email address to see all your purchases.</p>`,
        ].join('\n'),
      })
    }
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
