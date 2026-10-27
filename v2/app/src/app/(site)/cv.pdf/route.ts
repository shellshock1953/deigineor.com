import { cvFileName, cvLocale, getCv } from '../../../lib/cv'
import { renderCvPdf } from '../../../components/CvPdf'

// Rendered per request from the `cv` global (no database in CI at build time).
export const dynamic = 'force-dynamic'

// Rendering is CPU-heavy and the pod is small: keep one PDF per locale, re-rendered when the CV is edited.
const cache = new Map<string, { key: string; pdf: Buffer }>()

export async function GET(request: Request) {
  const locale = cvLocale(new URL(request.url).searchParams.get('lang'))
  const cv = await getCv(locale)
  const key = String(cv.updatedAt)
  let pdf = cache.get(locale)?.key === key ? cache.get(locale)!.pdf : null
  if (!pdf) {
    pdf = await renderCvPdf(cv, locale)
    cache.set(locale, { key, pdf })
  }
  return new Response(new Uint8Array(pdf), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${cvFileName(locale)}"`,
      'Cache-Control': 'public, max-age=60',
    },
  })
}
