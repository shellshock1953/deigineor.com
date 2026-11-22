import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import OwnedDownload from '../../../../components/OwnedDownload'
import PaddleBuyButton from '../../../../components/PaddleBuyButton'
import { CoverImage, coverUrl } from '../../../../components/cards'
import { priceLabel } from '../../../../lib/format'
import { getLibraryBySlug } from '../../../../lib/data'
import { getPaddleConfig } from '../../../../lib/paddle'
import { excerpt } from '../../../../lib/rich-text'

// Dynamic: the sandbox checkout gate reads searchParams (static params + ISR → DYNAMIC_SERVER_USAGE 500).
export const dynamic = 'force-dynamic'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const l = await getLibraryBySlug(slug)
  if (!l) return { title: 'Not found' }
  const description = l.tagline || excerpt(l.description, 160) || undefined
  const image = coverUrl(l.image, 'card') ?? undefined
  return {
    title: l.title,
    description,
    openGraph: {
      title: l.title,
      description,
      type: 'website',
      images: image
        ? [{ url: image, alt: l.image && typeof l.image === 'object' ? l.image.alt : undefined }]
        : undefined,
    },
  }
}

export default async function InstrumentPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ checkout?: string }>
}) {
  const { slug } = await params
  const { checkout } = await searchParams
  const l = await getLibraryBySlug(slug)
  if (!l) notFound()

  const isPaid = l.pricing === 'paid'
  // Paid items without a price yet are announced, not sold.
  const comingSoon = isPaid && l.price == null
  const actionUrl = comingSoon ? null : isPaid ? l.buyUrl : l.downloadUrl
  const paddle = getPaddleConfig()
  // shortcut: sandbox checkout hidden from real visitors; remove the gate when switching to production
  const paddleVisible = paddle?.env !== 'sandbox' || checkout === 'test'
  const paddleBuy = isPaid && l.paddlePriceId && l.price != null && paddle && paddleVisible

  return (
    <article className="container">
      <div className="detail">
        <div className="detail__media">
          <CoverImage media={l.image} size="card" />
        </div>
        <div>
          <header className="detail__head">
            <div className="detail__meta">
              <span className="mono mono--accent">
                {l.kind === 'plugin' ? 'Plugin' : 'Sample library'}
              </span>
              <span className="mono">
                {comingSoon
                  ? 'Coming soon'
                  : isPaid
                    ? `Paid · ${priceLabel(l.price ?? 0, l.currency)}`
                    : 'Free'}
              </span>
              {l.version && <span className="mono">v{l.version}</span>}
            </div>
            <h1 className="detail__title">{l.title}</h1>
            {l.tagline && <p className="detail__tagline">{l.tagline}</p>}
            {l.platforms && l.platforms.length > 0 && (
              <div className="chips">
                {l.platforms.map((p) => (
                  <span className="chip" key={p.id ?? p.platform}>
                    {p.platform}
                  </span>
                ))}
              </div>
            )}
          </header>

          {l.description && (
            <div className="rich-text">
              <RichText data={l.description} />
            </div>
          )}

          {l.format && (
            <p className="mono" style={{ margin: '18px 0 0' }}>
              Format: {l.format}
            </p>
          )}
          {l.collaborator && (
            <p className="mono" style={{ margin: '8px 0 0' }}>
              With {l.collaborator}
            </p>
          )}

          <div className="detail__links">
            {paddleBuy ? (
              <PaddleBuyButton
                config={paddle}
                priceId={l.paddlePriceId!}
                slug={l.slug}
                label={`Buy — ${priceLabel(l.price ?? 0, l.currency)}`}
              />
            ) : (
              actionUrl && (
                <a
                  className="btn btn--primary"
                  href={actionUrl}
                  rel="noopener noreferrer"
                  data-track="library_get"
                  data-library={l.slug}
                  data-action={isPaid ? 'buy' : 'download'}
                >
                  {isPaid
                    ? `Buy — ${priceLabel(l.price ?? 0, l.currency)}`
                    : 'Download on Pianobook'}
                </a>
              )
            )}
            <OwnedDownload slug={l.slug} />
            {l.demoLinks?.map((d) => (
              <a
                className="btn btn--sm"
                key={d.id ?? d.label}
                href={d.url}
                rel="noopener noreferrer"
              >
                {d.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
