export type PaddleConfig = { env: 'sandbox' | 'production'; token: string }

export type PaddlePrice = {
  price: number
  currency: string
  originalPrice?: number
  discountId?: string
  discountPercent?: number
}

/**
 * Read at request time. Next inlines a literal `process.env.NEXT_PUBLIC_*` at build,
 * and CI builds the image without these, so go through an alias (not inlined).
 */
export function getPaddleConfig(): PaddleConfig | null {
  const e = process.env
  const token = e.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN
  if (!token || token === '__PADDLE_CLIENT_TOKEN__') return null
  return { env: e.NEXT_PUBLIC_PADDLE_ENV === 'production' ? 'production' : 'sandbox', token }
}

type RawPrice = {
  data?: {
    id: string
    product_id: string
    status: string
    unit_price: { amount: string; currency_code: string }
  }
}

type RawDiscount = {
  id: string
  status: string
  enabled_for_checkout: boolean
  type: 'percentage' | 'flat' | 'flat_per_seat'
  amount: string
  currency_code?: string | null
  restrict_to?: string[] | null
  expires_at?: string | null
  usage_limit?: number | null
  times_used?: number
}

export function resolvePaddlePrice(
  rawPrice: RawPrice['data'],
  discounts: RawDiscount[],
  now = Date.now(),
): PaddlePrice | null {
  if (!rawPrice || rawPrice.status !== 'active') return null
  const baseCents = Number(rawPrice.unit_price.amount)
  if (!Number.isFinite(baseCents) || baseCents < 0) return null
  const currency = rawPrice.unit_price.currency_code
  const base = baseCents / 100

  const discount = discounts.find((d) => {
    if (d.status !== 'active' || !d.enabled_for_checkout) return false
    if (d.expires_at && Date.parse(d.expires_at) <= now) return false
    if (d.usage_limit != null && (d.times_used ?? 0) >= d.usage_limit) return false
    if (!d.restrict_to || d.restrict_to.length === 0) return true
    return d.restrict_to.includes(rawPrice.id) || d.restrict_to.includes(rawPrice.product_id)
  })

  if (discount) {
    const amt = Number(discount.amount)
    if (discount.type === 'percentage' && amt > 0 && amt < 100) {
      const finalCents = Math.round(baseCents * (1 - amt / 100))
      return {
        price: finalCents / 100,
        currency,
        originalPrice: base,
        discountId: discount.id,
        discountPercent: amt,
      }
    }
    if (discount.type === 'flat' && discount.currency_code === currency && amt > 0 && amt < baseCents) {
      const finalCents = baseCents - Math.round(amt)
      return {
        price: finalCents / 100,
        currency,
        originalPrice: base,
        discountId: discount.id,
      }
    }
  }

  return { price: base, currency }
}

// shortcut: 60s in-memory cache per priceId so pages stay fast while Paddle price/discount edits appear within a minute
const priceCache = new Map<string, { at: number; value: PaddlePrice | null }>()
const PRICE_TTL_MS = 60_000

export async function getPaddlePrice(
  priceId: string | null | undefined,
  opts?: { sandbox?: boolean; now?: number },
): Promise<PaddlePrice | null> {
  if (!priceId) return null
  const e = process.env
  const isSandbox = opts?.sandbox || e.NEXT_PUBLIC_PADDLE_ENV !== 'production'
  const apiKey = isSandbox ? (e.PADDLE_SANDBOX_API_KEY || e.PADDLE_API_KEY) : e.PADDLE_API_KEY
  if (!apiKey) return null

  const key = `${isSandbox ? 'sbx' : 'prd'}:${priceId}`
  const now = opts?.now ?? Date.now()
  const hit = priceCache.get(key)
  if (hit && now - hit.at < PRICE_TTL_MS) return hit.value

  const apiBase = isSandbox ? 'sandbox-api' : 'api'
  const headers = { Authorization: `Bearer ${apiKey}` }
  try {
    const [pRes, dRes] = await Promise.all([
      fetch(`https://${apiBase}.paddle.com/prices/${encodeURIComponent(priceId)}`, { headers, cache: 'no-store' }),
      fetch(`https://${apiBase}.paddle.com/discounts?status=active&mode=standard`, { headers, cache: 'no-store' }),
    ])
    if (!pRes.ok) return hit?.value ?? null
    const pJson = (await pRes.json()) as RawPrice
    const dJson = dRes.ok ? ((await dRes.json()) as { data?: RawDiscount[] }) : { data: [] }
    const value = resolvePaddlePrice(pJson.data, dJson.data ?? [], now)
    priceCache.set(key, { at: now, value })
    return value
  } catch {
    return hit?.value ?? null
  }
}
