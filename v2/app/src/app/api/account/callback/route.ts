import { SESSION_COOKIE, TTL_SECONDS, signToken, verifyToken } from '../../../../lib/account'

export const dynamic = 'force-dynamic'

// Not single-use on purpose: mail scanners prefetch links, a one-shot token would be burnt before the buyer clicks.
export async function GET(request: Request) {
  const email = verifyToken('login', new URL(request.url).searchParams.get('token'))
  if (!email) return new Response(null, { status: 303, headers: { Location: '/account?expired=1', 'Cache-Control': 'no-store' } })
  const headers = new Headers({ Location: '/account', 'Cache-Control': 'no-store' })
  headers.append(
    'Set-Cookie',
    `${SESSION_COOKIE}=${signToken('session', email)}; Max-Age=${TTL_SECONDS.session}; Path=/; HttpOnly; Secure; SameSite=Lax`,
  )
  return new Response(null, { status: 303, headers })
}
