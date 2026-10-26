import config from '@payload-config'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

// Readiness: the database answers.
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.count({ collection: 'users' })
    return new Response('ok')
  } catch {
    return new Response('database unavailable', { status: 503 })
  }
}
