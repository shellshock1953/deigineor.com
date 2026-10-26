import { getPayload } from 'payload'
import config from '@payload-config'

export const dynamic = 'force-dynamic'

// Post-deploy check (`just error-check`): an authenticated GET throws on purpose so Next's
// onRequestError reports it to GlitchTip. Anyone else gets a plain 404.
export async function GET(request: Request) {
  const payload = await getPayload({ config })
  const { user } = await payload.auth({ headers: request.headers })
  if (!user) return new Response(null, { status: 404 })
  const t = new URL(request.url).searchParams.get('t') ?? Date.now()
  throw new Error(`deigineor selftest ${t}`)
}
