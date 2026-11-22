import { licensesFor, sessionEmail } from '../../../../lib/account-server'

export const dynamic = 'force-dynamic'

const noStore = { 'Cache-Control': 'no-store' }

export async function GET() {
  const email = await sessionEmail()
  if (!email) return new Response(null, { status: 401, headers: noStore })
  const products = (await licensesFor(email)).filter((l) => l.status === 'active').map((l) => l.product)
  return Response.json({ email, products: [...new Set(products)] }, { headers: noStore })
}
