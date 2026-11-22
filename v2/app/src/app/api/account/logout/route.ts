import { SESSION_COOKIE } from '../../../../lib/account'

export const dynamic = 'force-dynamic'

export async function POST() {
  return new Response(null, {
    status: 303,
    headers: {
      Location: '/account',
      'Cache-Control': 'no-store',
      'Set-Cookie': `${SESSION_COOKIE}=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Lax`,
    },
  })
}
