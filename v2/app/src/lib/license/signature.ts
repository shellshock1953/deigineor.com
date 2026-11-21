import { createHmac, timingSafeEqual } from 'node:crypto'

const MAX_SKEW_S = 5 * 60

/** Verifies a `Paddle-Signature` header (`ts=...;h1=...`) against the exact raw body. */
export function verifyPaddleSignature(
  header: string | null,
  rawBody: string,
  secret: string,
  nowMs = Date.now(),
): boolean {
  if (!header) return false
  const parts = header.split(';').map((p) => p.split('=') as [string, string])
  const ts = parts.find(([k]) => k === 'ts')?.[1]
  if (!ts || !/^\d+$/.test(ts) || Math.abs(nowMs / 1000 - Number(ts)) > MAX_SKEW_S) return false
  const expected = createHmac('sha256', secret).update(`${ts}:${rawBody}`).digest()
  // Several h1 values appear while a secret is being rotated; any match is enough.
  return parts.some(([k, v]) => {
    if (k !== 'h1' || !/^[0-9a-f]{64}$/i.test(v ?? '')) return false
    return timingSafeEqual(expected, Buffer.from(v, 'hex'))
  })
}
