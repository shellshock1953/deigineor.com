import path from 'path'
import type { CollectionConfig } from 'payload'
import { isAuthed } from '../fields'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: 'Media', plural: 'Media' },
  access: { read: () => true, create: isAuthed, update: isAuthed, delete: isAuthed },
  admin: { useAsTitle: 'alt' },
  upload: {
    staticDir: path.resolve(/* turbopackIgnore: true */ process.env.MEDIA_DIR || './media'),
    mimeTypes: ['image/*'],
    adminThumbnail: 'thumb',
    imageSizes: [
      { name: 'thumb', width: 400 },
      { name: 'card', width: 800 },
      { name: 'og', width: 1200, height: 630, fit: 'cover' },
    ],
  },
  fields: [{ name: 'alt', type: 'text', required: true }],
}
