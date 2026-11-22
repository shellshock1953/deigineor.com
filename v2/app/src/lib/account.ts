import { createHmac, timingSafeEqual } from 'node:crypto'

// Stateless buyer sign-in: a signed token carries purpose, email and expiry. No Payload auth collection on purpose,
// because `isAuthed` is `Boolean(req.user)` and a buyer user would read every licence and the admin.
export type Purpose = 'login' | 'session'

export const SESSION_COOKIE = 'dg_session'
export const TTL_SECONDS: Record<Purpose, number> = { login: 15 * 60, session: 30 * 24 * 3600 }

export const normalizeEmail = (email: string) => email.trim().toLowerCase()

const key = (label = 'deigineor-account-v1') => {
  const secret = process.env.PAYLOAD_SECRET
  if (!secret) throw new Error('account: PAYLOAD_SECRET is not set') // fail closed
  return createHmac('sha256', secret).update(label).digest()
}
/** Hex HMAC of `data` under a key derived from PAYLOAD_SECRET and `label` (a separate key per use). */
export const keyedHex = (label: string, data: string) => createHmac('sha256', key(label)).update(data).digest('hex')
const mac = (body: string) => createHmac('sha256', key()).update(body).digest()

export function signToken(purpose: Purpose, email: string, now = Date.now()): string {
  const exp = Math.floor(now / 1000) + TTL_SECONDS[purpose]
  const body = Buffer.from(`${purpose}|${normalizeEmail(email)}|${exp}`).toString('base64url')
  return `${body}.${mac(body).toString('base64url')}`
}

/** The email in a valid, unexpired token of this purpose, else null. */
export function verifyToken(purpose: Purpose, token: string | undefined | null, now = Date.now()): string | null {
  const [body, sig, ...rest] = (token ?? '').split('.')
  if (!body || !sig || rest.length) return null
  const given = Buffer.from(sig, 'base64url')
  const want = mac(body)
  if (given.length !== want.length || !timingSafeEqual(given, want)) return null
  // The email may not contain '|' (it is validated at login), so a plain split is unambiguous.
  const [p, email, exp] = Buffer.from(body, 'base64url').toString().split('|')
  if (p !== purpose || !email || !(Number(exp) > now / 1000)) return null
  return email
}
