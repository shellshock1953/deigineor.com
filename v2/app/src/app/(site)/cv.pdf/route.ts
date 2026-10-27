import { cvFileName, cvLocale, getCv } from '../../../lib/cv'
import { renderCvPdf } from '../../../components/CvPdf'

// Rendered per request from the `cv` global (no database in CI at build time).
export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const locale = cvLocale(new URL(request.url).searchParams.get('lang'))
  const pdf = await renderCvPdf(await getCv(locale), locale)
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cvFileName(locale)}"`,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
