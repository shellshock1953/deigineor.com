import { licensesFor, sessionEmail } from '../../../../lib/account-server'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET() {
  const email = await sessionEmail()
  // Signed out is a normal answer, not 401: every store page asks, and CrowdSec bans IPs with many 401s (http-generic-401-bf).
  if (!email) return Response.json({ email: null, products: [] }, { headers: noStore })
  const products = (await licensesFor(email)).filter((l) => l.status === 'active').map((l) => l.product)
  return Response.json({ email, products: [...new Set(products)] }, { headers: noStore })
}
