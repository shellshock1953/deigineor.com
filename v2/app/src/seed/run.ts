import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import type { Payload } from 'payload'

import cv from '../../seed/cv.json'
import data from '../../seed/data.json'

const text = (t: string): Record<string, unknown> => ({
  type: 'text',
  text: t,
  format: 0,
  mode: 'normal',
  style: '',
  detail: 0,
  version: 1,
})
const lines = (t: string) =>
  t.split('\n').flatMap((l, i) => (i ? [{ type: 'linebreak', version: 1 }, text(l)] : [text(l)]))
const block = (type: string, children: Record<string, unknown>[], extra = {}) => ({
  type,
  children,
  direction: 'ltr' as const,
  format: '' as const,
  indent: 0,
  version: 1,
  ...extra,
})

type Block = { type: 'p'; text: string } | { type: 'ol' | 'ul'; items: string[] }

// Minimal Lexical state: paragraphs (with line breaks) and lists.
const lexical = (blocks: Block[] | string[]) => ({
  root: block(
    'root',
    blocks.map((b) =>
      typeof b === 'string' || b.type === 'p'
        ? block('paragraph', lines(typeof b === 'string' ? b : b.text), { textFormat: 0 })
        : block(
            'list',
            b.items.map((item, i) => block('listitem', [text(item)], { value: i + 1 })),
            { listType: b.type === 'ol' ? 'number' : 'bullet', start: 1, tag: b.type },
          ),
    ),
  ),
})

function resolveImgDir(options: SeedOptions) {
  const defaultSeedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../seed')
  const imgDir = options.imgDir ?? path.join(defaultSeedDir, 'img')
  return !fs.existsSync(imgDir) && fs.existsSync(path.join(defaultSeedDir, 'img'))
    ? path.join(defaultSeedDir, 'img')
    : imgDir
}

// Media is keyed by file name: re-seeding reuses the existing upload.
async function seedMedia(payload: Payload, imgDir: string, file: string, alt: string) {
  const filename = path.basename(file)
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
    overrideAccess: true,
  })
  if (docs[0]) return docs[0].id
  const filePath = path.join(/* turbopackIgnore: true */ imgDir, file)
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath,
    overrideAccess: true,
  })
  return created.id
}

export interface SeedOptions {
  imgDir?: string
}

export interface SeedResult {
  releases: number
  videos: number
  libraries: number
}

/**
 * Seeds content from seed/data.json and images from imgDir.
 * Idempotent (upserts documents by slug, reuses media by filename).
 */
export async function seed(payload: Payload, options: SeedOptions = {}): Promise<SeedResult> {
  const imgDir = resolveImgDir(options)

  async function upsert(
    collection: 'releases' | 'videos' | 'libraries',
    doc: Record<string, unknown>,
  ) {
    const { docs } = await payload.find({
      collection,
      where: { slug: { equals: doc.slug as string } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args: any = { collection, data: doc, overrideAccess: true }
    if (docs[0]) await payload.update({ ...args, id: docs[0].id })
    else await payload.create(args)
    console.log(`${docs[0] ? 'updated' : 'created'} ${collection}/${doc.slug}`)
  }

  const media = (file: string, alt: string) => seedMedia(payload, imgDir, file, alt)

  let releasesCount = 0
  for (const r of data.releases) {
    const { cover, coverAlt, genres, releaseDate, ...rest } = r
    await upsert('releases', {
      ...rest,
      releaseDate: `${releaseDate}T00:00:00.000Z`,
      genres: genres.map((genre) => ({ genre })),
      cover: await media(cover, coverAlt),
      published: true,
    })
    releasesCount++
  }

  let videosCount = 0
  for (const v of data.videos) {
    const { tools, ...rest } = v
    await upsert('videos', { ...rest, tools: tools.map((tool) => ({ tool })) })
    videosCount++
  }

  let librariesCount = 0
  for (const l of data.libraries) {
    const { image, imageAlt, description, ...rest } = l
    await upsert('libraries', {
      ...rest,
      kind: 'sample-library',
      pricing: 'free',
      platforms: [{ platform: 'Kontakt' }],
      description: lexical(description as Block[]),
      image: await media(image, imageAlt),
      published: true,
    })
    librariesCount++
  }

  const { about, ...site } = data.site
  await payload.updateGlobal({
    slug: 'site',
    data: { ...site, about: lexical(about) },
    overrideAccess: true,
  })
  console.log('updated global/site')

  await seedCv(payload, options)

  console.log(
    `Seeding complete: ${releasesCount} releases, ${librariesCount} libraries, ${videosCount} videos, site and cv globals`,
  )

  return {
    releases: releasesCount,
    videos: videosCount,
    libraries: librariesCount,
  }
}

type CvText = typeof cv.en

// Array rows are shared between locales, only their text differs.
const cvLocaleData = (t: CvText) => ({
  name: t.name,
  location: t.location,
  about: t.about,
  roles: t.roles.map((text) => ({ text })),
  education: t.education,
  skills: t.skills,
  experience: t.experience.map((text) => ({ text })),
})

/** Seeds the `cv` global from seed/cv.json in both locales (overwrites it; boot seeding only runs when it is empty). */
export async function seedCv(payload: Payload, options: SeedOptions = {}) {
  const photo = await seedMedia(payload, resolveImgDir(options), cv.photo, cv.photoAlt)
  const { phone, email, website, links } = cv
  await payload.updateGlobal({
    slug: 'cv',
    locale: 'en',
    data: { phone, email, website, links, photo, ...cvLocaleData(cv.en) },
    overrideAccess: true,
  })

  // The uk update must reuse the row ids created by the en one, or it would replace the rows.
  const base = await payload.findGlobal({ slug: 'cv', locale: 'en', depth: 0, overrideAccess: true })
  const uk = cvLocaleData(cv.uk)
  const withIds = <T extends object>(rows: T[], ids?: { id?: string | null }[]) =>
    rows.map((row, i) => ({ ...row, id: ids?.[i]?.id ?? undefined }))
  await payload.updateGlobal({
    slug: 'cv',
    locale: 'uk',
    data: {
      name: uk.name,
      location: uk.location,
      about: uk.about,
      roles: withIds(uk.roles, base.roles ?? []),
      education: withIds(uk.education, base.education ?? []),
      skills: withIds(uk.skills, base.skills ?? []),
      experience: withIds(uk.experience, base.experience ?? []),
    },
    overrideAccess: true,
  })
  console.log('updated global/cv (en, uk)')
}
