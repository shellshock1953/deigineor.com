import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import { CoverImage, coverUrl } from '../../../../components/cards'
import { priceLabel } from '../../../../lib/format'
import { getLibraries, getLibraryBySlug } from '../../../../lib/data'
import { excerpt } from '../../../../lib/rich-text'

export const revalidate = 60

/** See `/music/[slug]`: params are only listed when the DB is reachable at build. */
export async function generateStaticParams() {
  try {
    const libraries = await getLibraries()
    return libraries.map((l) => ({ slug: l.slug }))
  } catch {
    return []
  }
}

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

export default async function InstrumentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const l = await getLibraryBySlug(slug)
  if (!l) notFound()

  const isPaid = l.pricing === 'paid'
  const actionUrl = isPaid ? l.buyUrl : l.downloadUrl

  return (
    <article className="container">
      <div className="detail">
        <div className="detail__media">
          <CoverImage media={l.image} size="card" />
        </div>
        <div>
          <header className="detail__head">
            <div className="detail__meta">
              <span className="mono mono--accent">{l.kind === 'plugin' ? 'Plugin' : 'Sample library'}</span>
              <span className="mono">{isPaid ? `Paid · ${priceLabel(l.price ?? 0, l.currency)}` : 'Free'}</span>
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
            {actionUrl && (
              <a
                className="btn btn--primary"
                href={actionUrl}
                rel="noopener noreferrer"
                data-track="library_get"
                data-library={l.slug}
                data-action={isPaid ? 'buy' : 'download'}
              >
                {isPaid ? `Buy — ${priceLabel(l.price ?? 0, l.currency)}` : 'Download on Pianobook'}
              </a>
            )}
            {l.demoLinks?.map((d) => (
              <a className="btn btn--sm" key={d.id ?? d.label} href={d.url} rel="noopener noreferrer">
                {d.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </article>
  )
}
