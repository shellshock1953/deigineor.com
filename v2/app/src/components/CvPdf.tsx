import fs from 'fs'
import path from 'path'
import { Document, Font, Image, Link, Page, renderToBuffer, StyleSheet, Text, View } from '@react-pdf/renderer'

import { CV_LABELS, paragraphs, type Cv, type CvLocale } from '../lib/cv'

// Inter subset with Latin + Cyrillic, served from public/ so it is also in the standalone image.
const fontDir = path.join(/* turbopackIgnore: true */ process.cwd(), 'public', 'fonts')
Font.register({
  family: 'Inter',
  fonts: [
    { src: path.join(fontDir, 'Inter-400.ttf'), fontWeight: 400 },
    { src: path.join(fontDir, 'Inter-700.ttf'), fontWeight: 700 },
  ],
})
// No hyphenation: URLs and Ukrainian words should wrap only at spaces.
Font.registerHyphenationCallback((word) => [word])

const INK = '#1a1f1c'
const MUTED = '#4d5750'
const ACCENT = '#1f6b3a'

const s = StyleSheet.create({
  page: { fontFamily: 'Inter', fontSize: 9, lineHeight: 1.4, color: INK, paddingVertical: 30, paddingHorizontal: 40 },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 },
  name: { fontSize: 22, lineHeight: 1.2, fontWeight: 700, marginBottom: 4 },
  contact: { color: MUTED },
  photo: { width: 64, height: 64, borderRadius: 32, objectFit: 'cover' },
  h: {
    fontSize: 10,
    fontWeight: 700,
    color: ACCENT,
    textTransform: 'uppercase',
    letterSpacing: 1,
    borderBottomWidth: 0.75,
    borderBottomColor: '#c9d1c7',
    paddingBottom: 2,
    marginTop: 9,
    marginBottom: 4,
  },
  p: { marginBottom: 4 },
  row: { flexDirection: 'row', marginBottom: 2 },
  bullet: { width: 10 },
  grow: { flex: 1 },
  label: { width: 78, fontWeight: 700 },
  detail: { color: MUTED },
  link: { color: INK, textDecoration: 'none' },
})

const Item = ({ children }: { children: string }) => (
  <View style={s.row} wrap={false}>
    <Text style={s.bullet}>•</Text>
    <Text style={s.grow}>{children}</Text>
  </View>
)

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <View>
    <Text style={s.h} minPresenceAhead={40}>
      {title}
    </Text>
    {children}
  </View>
)

function photoSrc(cv: Cv) {
  const photo = cv.photo
  if (!photo || typeof photo === 'number' || !photo.filename) return null
  // react-pdf embeds JPEG and PNG only.
  if (photo.mimeType !== 'image/jpeg' && photo.mimeType !== 'image/png') return null
  const file = path.resolve(/* turbopackIgnore: true */ process.env.MEDIA_DIR || './media', photo.filename)
  try {
    return { data: fs.readFileSync(file), format: photo.mimeType === 'image/png' ? ('png' as const) : ('jpg' as const) }
  } catch {
    return null
  }
}

function CvDocument({ cv, locale }: { cv: Cv; locale: CvLocale }) {
  const t = CV_LABELS[locale]
  const photo = photoSrc(cv)
  const contact = [cv.location, cv.phone, cv.email, cv.website].filter(Boolean)
  const about = paragraphs(cv.about)

  return (
    <Document title={`${cv.name ?? ''} — ${t.title}`} author={cv.name ?? undefined} language={locale}>
      <Page size="A4" style={s.page}>
        <View style={s.head}>
          <View style={s.grow}>
            <Text style={s.name}>{cv.name}</Text>
            <Text style={s.contact}>{contact.join('  |  ')}</Text>
          </View>
          {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf Image has no alt prop */}
          {photo && <Image style={s.photo} src={photo} />}
        </View>

        {about.length > 0 && (
          <Section title={t.about}>
            {about.map((p) => (
              <Text key={p} style={s.p}>
                {p}
              </Text>
            ))}
          </Section>
        )}

        {!!cv.roles?.length && (
          <Section title={t.roles}>
            <Text>{cv.roles.map((r) => r.text).join('  •  ')}</Text>
          </Section>
        )}

        {!!cv.experience?.length && (
          <Section title={t.experience}>
            {cv.experience.map((e) => (
              <Item key={e.id}>{e.text}</Item>
            ))}
          </Section>
        )}

        {!!cv.education?.length && (
          <Section title={t.education}>
            {cv.education.map((e) => (
              <Text key={e.id} style={s.p}>
                {e.title}
                {e.detail ? <Text style={s.detail}>{` — ${e.detail}`}</Text> : null}
              </Text>
            ))}
          </Section>
        )}

        {!!cv.skills?.length && (
          <Section title={t.skills}>
            {cv.skills.map((k) => (
              <View key={k.id} style={s.row} wrap={false}>
                <Text style={s.label}>{k.label}</Text>
                <Text style={s.grow}>{k.items}</Text>
              </View>
            ))}
          </Section>
        )}

        {!!cv.links?.length && (
          <Section title={t.links}>
            {cv.links.map((l) => (
              <View key={l.id} style={s.row} wrap={false}>
                <Text style={s.label}>{l.platform}</Text>
                <Link style={[s.grow, s.link]} src={l.url}>
                  {l.url}
                </Link>
              </View>
            ))}
          </Section>
        )}
      </Page>
    </Document>
  )
}

export const renderCvPdf = (cv: Cv, locale: CvLocale) => renderToBuffer(<CvDocument cv={cv} locale={locale} />)
