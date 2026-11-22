import { after } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'

import { normalizeEmail, signToken } from '../../../../lib/account'
import { SITE_URL, sendEmail } from '../../../../lib/email'

export const dynamic = 'force-dynamic'

const THROTTLE_MS = 60_000
// shortcut: per-pod in-memory throttle, move to DB if abused
const lastSent = new Map<string, number>()

const EMAIL = /^[^\s@|]+@[^\s@|]+\.[^\s@|]+$/

// Same answer whether or not the address has licences (no account enumeration).
export async function POST(request: Request) {
  const json = request.headers.get('content-type')?.includes('application/json')
  const raw = json ? (await request.json().catch(() => null))?.email : (await request.formData().catch(() => null))?.get('email')
  const email = typeof raw === 'string' ? normalizeEmail(raw) : ''
  const valid = email.length <= 254 && EMAIL.test(email)
  const reply = (ok: boolean) =>
    json
      ? Response.json({ ok }, { status: ok ? 200 : 400 })
      : new Response(null, { status: 303, headers: { Location: `/account?${ok ? 'sent' : 'invalid'}=1` } })
  if (!valid) return reply(false)

  const now = Date.now()
  if (now - (lastSent.get(email) ?? 0) < THROTTLE_MS) return reply(true)
  lastSent.delete(email) // re-insert at the end: the map stays ordered by time, so the sweep stops at the first fresh entry
  lastSent.set(email, now)
  for (const [k, t] of lastSent) {
    if (now - t < THROTTLE_MS) break
    lastSent.delete(k)
  }

  // Lookup and send after the response, so its timing doesn't tell whether the address has purchases.
  after(async () => {
    const payload = await getPayload({ config })
    const found = await payload.find({ collection: 'licenses', where: { email: { equals: email } }, limit: 1, depth: 0 })
    if (!found.docs.length) return
    const link = `${SITE_URL}/api/account/callback?token=${signToken('login', email)}`
    const sent = await sendEmail({
      to: email,
      subject: 'Sign in to deigineor.com',
      text: `Use this link to sign in and see your purchases (valid for 15 minutes):\n\n${link}\n\nIf you did not ask for it, ignore this email.`,
      html: `<p>Use this link to sign in and see your purchases (valid for 15 minutes):</p><p><a href="${link}">Sign in to deigineor.com</a></p><p>If you did not ask for it, ignore this email.</p>`,
    })
    if (!sent) lastSent.delete(email) // let the buyer retry at once
  })
  return reply(true)
}
