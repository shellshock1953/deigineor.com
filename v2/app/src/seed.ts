/**
 * Idempotent import of the real content: `pnpm seed` (upserts by slug, safe to re-run).
 * Source data lives in ../seed/data.json and ../seed/img, so it works offline.
 */
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from './payload.config'
import data from '../seed/data.json'

const seedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../seed')

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

const payload = await getPayload({ config })

async function upsert(
  collection: 'releases' | 'videos' | 'libraries',
  doc: Record<string, unknown>,
) {
  const { docs } = await payload.find({
    collection,
    where: { slug: { equals: doc.slug as string } },
    limit: 1,
    depth: 0,
  })
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const args: any = { collection, data: doc }
  if (docs[0]) await payload.update({ ...args, id: docs[0].id })
  else await payload.create(args)
  console.log(`${docs[0] ? 'updated' : 'created'} ${collection}/${doc.slug}`)
}

// Media is keyed by file name: re-seeding reuses the existing upload.
async function media(file: string, alt: string) {
  const filename = path.basename(file)
  const { docs } = await payload.find({
    collection: 'media',
    where: { filename: { equals: filename } },
    limit: 1,
    depth: 0,
  })
  if (docs[0]) return docs[0].id
  const created = await payload.create({
    collection: 'media',
    data: { alt },
    filePath: path.join(seedDir, 'img', file),
  })
  return created.id
}

for (const r of data.releases) {
  const { cover, coverAlt, genres, releaseDate, ...rest } = r
  await upsert('releases', {
    ...rest,
    releaseDate: `${releaseDate}T00:00:00.000Z`,
    genres: genres.map((genre) => ({ genre })),
    cover: await media(cover, coverAlt),
    published: true,
  })
}

for (const v of data.videos) {
  const { tools, ...rest } = v
  await upsert('videos', { ...rest, tools: tools.map((tool) => ({ tool })) })
}

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
}

const { about, ...site } = data.site
await payload.updateGlobal({ slug: 'site', data: { ...site, about: lexical(about) } })
console.log('updated global/site')

process.exit(0)
