import { getLatest } from '../../../../../lib/download/studio'

export const dynamic = 'force-dynamic'

export async function GET() {
  const token = process.env.GITHUB_RELEASES_TOKEN
  if (!token) return new Response(null, { status: 503 })
  const latest = await getLatest(token).catch(() => null)
  if (!latest) return new Response(null, { status: 502 })
  return Response.json({ version: latest.version, os: Object.keys(latest.assets) }, { headers: { 'Cache-Control': 'no-store' } })
}
