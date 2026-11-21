import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// shortcut: the txn id is the bearer secret (Paddle ids are unguessable and only the buyer sees it); add an e-mailed token if it ever leaks
export async function GET(_request: Request, { params }: { params: Promise<{ txn: string }> }) {
  const { txn } = await params
  if (!/^txn_[0-9a-z]{1,64}$/.test(txn)) return new Response(null, { status: 404 })
  const payload = await getPayload({ config })
  const found = await payload.find({ collection: 'licenses', where: { txn: { equals: txn } }, limit: 1, depth: 0 })
  const doc = found.docs[0]
  if (!doc || doc.status !== 'active') return new Response(null, { status: 404 })
  return new Response(doc.licence, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': 'attachment; filename="Librarium.lic"',
      'Cache-Control': 'no-store',
    },
  })
}
