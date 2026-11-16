export type PaddleConfig = { env: 'sandbox' | 'production'; token: string }

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
