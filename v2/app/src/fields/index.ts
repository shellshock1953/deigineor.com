import type { Access, Field, PayloadRequest } from 'payload'

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** Unique URL slug, generated from `title` when left empty. */
export const slugField: Field = {
  name: 'slug',
  type: 'text',
  required: true,
  unique: true,
  index: true,
  admin: { position: 'sidebar', description: 'Generated from the title when empty.' },
  hooks: {
    beforeValidate: [({ value, data }) => slugify(String(value || data?.title || ''))],
  },
}

export const linkFields: Field[] = [
  { name: 'label', type: 'text', required: true },
  { name: 'url', type: 'text', required: true },
]

export const isAuthed = ({ req }: { req: PayloadRequest }) => Boolean(req.user)

/** Public sees published docs only; logged-in users see everything. */
export const publishedOrAuthed: Access = ({ req }) =>
  req.user ? true : { published: { equals: true } }
