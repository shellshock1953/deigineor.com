// eslint-disable-next-line @typescript-eslint/no-explicit-any -- Paddle payloads are untyped here
export type PaddleEvent = { event_type: string; occurred_at: string; data: Record<string, any> }
export type PaddleCustomer = { data: { name: string; email: string } }
export type RevokedEntry = { txn: string; action: string; adj: string; at: string }

export function issueLicense(
  seedHex: string,
  event: PaddleEvent,
  customer: PaddleCustomer,
  entitlement?: string,
  maxMajor?: number,
): string
export function revocationFor(event: PaddleEvent): string | null
export function revocationList(seedHex: string, issuedAt: string, entries: RevokedEntry[]): string
