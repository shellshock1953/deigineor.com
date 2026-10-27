import config from '@payload-config'
import { getPayload } from 'payload'

export type CvLocale = 'en' | 'uk'

/** `?lang=uk` selects Ukrainian, anything else is English. */
export const cvLocale = (lang: unknown): CvLocale => (lang === 'uk' ? 'uk' : 'en')

export const cvQuery = (locale: CvLocale) => (locale === 'uk' ? '?lang=uk' : '')

export const cvFileName = (locale: CvLocale) =>
  `Serhii-Sukhomlinov-CV${locale === 'uk' ? '-uk' : ''}.pdf`

// UI strings for the page and the PDF; the CV content itself comes from the `cv` global.
export const CV_LABELS = {
  en: {
    title: 'CV',
    about: 'About me',
    roles: 'Professional profile',
    education: 'Education',
    skills: 'Skills',
    experience: 'Experience',
    links: 'Links',
    download: 'Download PDF',
    language: 'Language',
  },
  uk: {
    title: 'Резюме',
    about: 'Про мене',
    roles: 'Професійний профіль',
    education: 'Освіта',
    skills: 'Навички',
    experience: 'Досвід',
    links: 'Посилання',
    download: 'Завантажити PDF',
    language: 'Мова',
  },
} as const

export async function getCv(locale: CvLocale) {
  const payload = await getPayload({ config })
  return payload.findGlobal({ slug: 'cv', locale, depth: 1, overrideAccess: false })
}

export type Cv = Awaited<ReturnType<typeof getCv>>

/** Paragraphs of the textarea, split on blank lines. */
export const paragraphs = (text?: string | null) =>
  (text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
