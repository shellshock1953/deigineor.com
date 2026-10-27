import type { Metadata } from 'next'
import Link from 'next/link'

import { coverUrl } from '../../../components/cards'
import { CV_LABELS, cvLocale, cvQuery, getCv, paragraphs, type CvLocale } from '../../../lib/cv'

type Props = { searchParams: Promise<{ lang?: string }> }

// Same rationale as the other pages: no prerender without a DB in CI.
export const dynamic = 'force-dynamic'

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const locale = cvLocale((await searchParams).lang)
  return {
    title: CV_LABELS[locale].title,
    description: 'Serhii Sukhomlinov (Deigineor): music composer, sound producer, mix engineer, sound designer.',
    alternates: { canonical: `/cv${cvQuery(locale)}` },
  }
}

const LOCALES: { locale: CvLocale; label: string; name: string }[] = [
  { locale: 'en', label: 'EN', name: 'English' },
  { locale: 'uk', label: 'УК', name: 'Українська' },
]

export default async function Cv({ searchParams }: Props) {
  const locale = cvLocale((await searchParams).lang)
  const t = CV_LABELS[locale]
  const cv = await getCv(locale)
  const photo = cv.photo && typeof cv.photo === 'object' ? cv.photo : null
  const photoUrl = photo && coverUrl(photo, 'card')
  const about = paragraphs(cv.about)
  const contact = [
    cv.location,
    cv.phone && <a key="p" href={`tel:${cv.phone}`}>{cv.phone}</a>,
    cv.email && <a key="e" href={`mailto:${cv.email}`}>{cv.email}</a>,
    cv.website && <a key="w" href={cv.website} rel="noopener noreferrer">{cv.website.replace(/^https?:\/\//, '')}</a>,
  ].filter(Boolean)

  return (
    <div className="container" lang={locale}>
      <header className="page-head cv-head">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- Payload serves the sizes
          <img className="cv-head__photo" src={photoUrl} alt={photo?.alt ?? ''} width={160} height={160} />
        )}
        <div>
          <span className="section__kicker">CH 05 · CV</span>
          <h1>{cv.name}</h1>
          <p className="page-head__sub cv-contact">
            {contact.map((c, i) => (
              <span key={i}>{c}</span>
            ))}
          </p>
          <div className="cv-actions">
            <a className="btn btn--primary btn--sm" href={`/cv.pdf${cvQuery(locale)}`} download>
              {t.download}
            </a>
            <nav className="filters" aria-label={t.language}>
              {LOCALES.map((l) => (
                <Link
                  key={l.locale}
                  href={`/cv${cvQuery(l.locale)}`}
                  lang={l.locale}
                  hrefLang={l.locale}
                  aria-label={l.name}
                  aria-current={l.locale === locale ? 'page' : undefined}
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </header>

      <div className="cv-grid">
        {about.length > 0 && (
          <section aria-labelledby="cv-about" className="cv-wide">
            <h2 id="cv-about" className="cv-h"><span className="section__kicker">{t.about}</span></h2>
            <div className="rich-text">
              {about.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          </section>
        )}

        {!!cv.roles?.length && (
          <section aria-labelledby="cv-roles">
            <h2 id="cv-roles" className="cv-h"><span className="section__kicker">{t.roles}</span></h2>
            <div className="chips">
              {cv.roles.map((r) => (
                <span key={r.id} className="chip chip--accent">
                  {r.text}
                </span>
              ))}
            </div>
          </section>
        )}

        {!!cv.education?.length && (
          <section aria-labelledby="cv-education">
            <h2 id="cv-education" className="cv-h"><span className="section__kicker">{t.education}</span></h2>
            <ul className="link-list cv-edu">
              {cv.education.map((e) => (
                <li key={e.id}>
                  <span>{e.title}</span>
                  {e.detail && <span className="mono">{e.detail}</span>}
                </li>
              ))}
            </ul>
          </section>
        )}

        {!!cv.experience?.length && (
          <section aria-labelledby="cv-experience">
            <h2 id="cv-experience" className="cv-h"><span className="section__kicker">{t.experience}</span></h2>
            <ul className="cv-list">
              {cv.experience.map((e) => (
                <li key={e.id}>{e.text}</li>
              ))}
            </ul>
          </section>
        )}

        {!!cv.skills?.length && (
          <section aria-labelledby="cv-skills">
            <h2 id="cv-skills" className="cv-h"><span className="section__kicker">{t.skills}</span></h2>
            <dl className="cv-skills">
              {cv.skills.map((k) => (
                <div key={k.id}>
                  <dt className="mono">{k.label}</dt>
                  <dd>{k.items}</dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        {!!cv.links?.length && (
          <section aria-labelledby="cv-links" className="cv-wide">
            <h2 id="cv-links" className="cv-h"><span className="section__kicker">{t.links}</span></h2>
            <ul className="link-list">
              {cv.links.map((l) => (
                <li key={l.id}>
                  <span className="mono">{l.platform}</span>
                  <a href={l.url} rel="noopener noreferrer">
                    {l.url.replace(/^https?:\/\/(www\.)?/, '')}
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
