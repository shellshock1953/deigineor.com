import type { Metadata } from 'next'
import { RichText } from '@payloadcms/richtext-lexical/react'
import { notFound } from 'next/navigation'

import OwnedDownload from '../../../../components/OwnedDownload'
import PaddleBuyButton from '../../../../components/PaddleBuyButton'
import { CoverImage, coverUrl } from '../../../../components/cards'
import { sessionEmail } from '../../../../lib/account-server'
import { STORE_URL } from '../../../../lib/email'
import { isEnabled, flagsReady } from '../../../../lib/flags'
import { priceLabel } from '../../../../lib/format'
import { getLibraryBySlug } from '../../../../lib/data'
import { getPaddleConfig, getPaddlePrice } from '../../../../lib/paddle'
import { PRODUCTS } from '../../../../lib/products'
import { excerpt } from '../../../../lib/rich-text'
import { isStoreRequest } from '../../../../lib/store'

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
  const store = await isStoreRequest()
  // The store host shows only things for sale.
  if (!l || (store && l.pricing !== 'paid')) notFound()

  const isPaid = l.pricing === 'paid'
  const paddle = getPaddleConfig()
  await flagsReady()
  const email = await sessionEmail()
  const isTester = Boolean(
    email && (isEnabled('deigineor.paddle-sandbox', email) || isEnabled('deigineor.tester', email)),
  )
  const useSandbox = paddle?.env === 'sandbox' || (isTester && Boolean(l.paddleSandboxPriceId))
  const activePriceId = useSandbox && l.paddleSandboxPriceId ? l.paddleSandboxPriceId : l.paddlePriceId
  const livePrice = isPaid ? await getPaddlePrice(activePriceId, { sandbox: useSandbox }) : null
  const displayPrice = livePrice?.price ?? l.price
  const displayCurrency = livePrice?.currency ?? l.currency
  // Paid items without a price yet are announced, not sold.
  const comingSoon = isPaid && displayPrice == null
  const actionUrl = comingSoon ? null : isPaid ? l.buyUrl : l.downloadUrl
  // shortcut: sandbox checkout hidden from real visitors unless signed in as a tester or using ?checkout=test
  const paddleVisible = paddle?.env !== 'sandbox' || checkout === 'test' || isTester
  // The Librarium page shows Player vs Studio editions (Player is free, see /player).
  const editions = Object.values(PRODUCTS).some((p) => p.librarySlug === l.slug)
  const paddleBuy = isPaid && activePriceId && displayPrice != null && paddle && paddleVisible

  const buy = (
    <>
      {paddleBuy && !store ? (
        // Checkout only opens on the store host.
        <a className="btn btn--primary" href={`${STORE_URL}/instruments/${l.slug}`} data-track="library_get" data-library={l.slug} data-action="buy">
          {`Buy — ${priceLabel(displayPrice ?? 0, displayCurrency)}${livePrice?.discountPercent != null ? ` (−${livePrice.discountPercent}%)` : ''}`}
        </a>
      ) : paddleBuy ? (
        <PaddleBuyButton
          config={paddle}
          priceId={l.paddlePriceId!}
          sandboxPriceId={l.paddleSandboxPriceId}
          discountId={livePrice?.discountId}
          slug={l.slug}
          label={`Buy — ${priceLabel(displayPrice ?? 0, displayCurrency)}${livePrice?.discountPercent != null ? ` (−${livePrice.discountPercent}%)` : ''}`}
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
              ? `Buy — ${priceLabel(displayPrice ?? 0, displayCurrency)}`
              : 'Download on Pianobook'}
          </a>
        )
      )}
    </>
  )

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
                {comingSoon ? (
                  'Coming soon'
                ) : isPaid ? (
                  <>
                    Paid ·{' '}
                    {livePrice?.originalPrice != null && (
                      <>
                        <s style={{ opacity: 0.65 }}>
                          {priceLabel(livePrice.originalPrice, displayCurrency)}
                        </s>{' '}
                      </>
                    )}
                    {priceLabel(displayPrice ?? 0, displayCurrency)}
                    {livePrice?.discountPercent != null && ` (−${livePrice.discountPercent}%)`}
                  </>
                ) : (
                  'Free'
                )}
              </span>
            </div>
            <h1 className="detail__title">{l.title}</h1>
            {l.tagline && (
              <p className="detail__tagline">
                {editions
                  ? `${l.tagline.replace(/\.$/, '')}. Two editions: Player to play instruments, Studio to build them.`
                  : l.tagline}
              </p>
            )}
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
            {!editions && buy}
            <OwnedDownload slug={l.slug} />
            {!store && l.demoLinks?.map((d) => (
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

      {editions && (
        <section className="editions" aria-label="Editions">
          <div className="edition">
            <span className="mono">Player</span>
            <h2>Play instruments</h2>
            <div className="edition__cost">Free</div>
            <ul>
              <li className="yes">Loads any .lbrp instrument</li>
              <li className="yes">Browser with categories, tags, search</li>
              <li className="yes">Presets, effects, mod and pitch wheels</li>
              <li className="no">UI designer</li>
              <li className="no">Wave Editor and mapping</li>
            </ul>
            <a className="btn" href="/player">
              Download free
            </a>
          </div>
          <div className="edition edition--studio">
            <span className="mono">Studio</span>
            <h2>Build instruments</h2>
            <div className="edition__cost">
              {comingSoon ? (
                'Coming soon'
              ) : (
                <>
                  {livePrice?.originalPrice != null && (
                    <>
                      <s style={{ opacity: 0.65, fontSize: '0.9rem' }}>{priceLabel(livePrice.originalPrice, displayCurrency)}</s>{' '}
                    </>
                  )}
                  {priceLabel(displayPrice ?? 0, displayCurrency)}
                </>
              )}
            </div>
            <ul>
              <li className="yes">Everything in Player</li>
              <li className="yes">UI designer with grid snapping</li>
              <li className="yes">Per-zone Wave Editor, mapping</li>
              <li className="yes">Save your own .lbrp libraries</li>
              <li className="yes">Licence for all your machines</li>
            </ul>
            {buy}
          </div>
        </section>
      )}
    </article>
  )
}
