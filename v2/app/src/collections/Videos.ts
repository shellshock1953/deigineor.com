import type { CollectionConfig } from 'payload'
import { isAuthed, slugField } from '../fields'
import { revalidateSite } from '../lib/revalidate'

export const Videos: CollectionConfig = {
  slug: 'videos',
  labels: { singular: 'Video', plural: 'Videos (game audio)' },
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'category', 'order'] },
  defaultSort: 'order',
  access: { read: () => true, create: isAuthed, update: isAuthed, delete: isAuthed },
  hooks: { afterChange: [() => revalidateSite()], afterDelete: [() => revalidateSite()] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    { name: 'youtubeId', type: 'text', required: true },
    {
      name: 'category',
      type: 'select',
      required: true,
      defaultValue: 'wwise',
      options: [
        { label: 'Wwise', value: 'wwise' },
        { label: 'Showreel', value: 'showreel' },
        { label: 'Other', value: 'other' },
      ],
    },
    { name: 'description', type: 'richText' },
    { name: 'tools', type: 'array', fields: [{ name: 'tool', type: 'text', required: true }] },
    { name: 'relatedRelease', type: 'relationship', relationTo: 'releases' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
  ],
}
