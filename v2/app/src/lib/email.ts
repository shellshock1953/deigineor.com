// Transactional email via Resend's REST API (no SDK: one POST). Domain deigineor.com is verified in Resend.
export const SITE_URL = 'https://deigineor.com'
const FROM = 'Deigineor <support@deigineor.com>'
const REPLY_TO = 'support@deigineor.com'

export type Email = { to: string; subject: string; text: string; html?: string; reply_to?: string }

/** Sends one email. Returns false (and logs) instead of throwing, so callers like the Paddle webhook never fail on email. */
export async function sendEmail(email: Email): Promise<boolean> {
  const key = process.env.RESEND_API_KEY
  if (!key?.startsWith('re_')) {
    console.error(`email: RESEND_API_KEY not set, not sending "${email.subject}"`)
    return false
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: FROM, reply_to: REPLY_TO, ...email }),
    })
    if (!res.ok) console.error(`email: resend answered ${res.status} for "${email.subject}": ${await res.text()}`)
    return res.ok
  } catch (err) {
    console.error(`email: resend request failed for "${email.subject}"`, err)
    return false
  }
}
