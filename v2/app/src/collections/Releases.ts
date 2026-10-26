import type { CollectionConfig } from 'payload'
import { isAuthed, linkFields, publishedOrAuthed, slugField } from '../fields'
import { revalidateSite } from '../lib/revalidate'

export const Releases: CollectionConfig = {
  slug: 'releases',
  admin: { useAsTitle: 'title', defaultColumns: ['title', 'kind', 'releaseDate', 'published'] },
  defaultSort: '-releaseDate',
  access: { read: publishedOrAuthed, create: isAuthed, update: isAuthed, delete: isAuthed },
  // Admin edits appear on the public site right away (on-demand ISR revalidation).
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'single',
      options: [
        { label: 'Single', value: 'single' },
        { label: 'Album', value: 'album' },
        { label: 'OST', value: 'ost' },
        { label: 'EP', value: 'ep' },
      ],
    },
    {
      name: 'releaseDate',
      type: 'date',
      required: true,
      admin: { date: { pickerAppearance: 'dayOnly' } },
    },
    { name: 'cover', type: 'upload', relationTo: 'media' },
    { name: 'genres', type: 'array', fields: [{ name: 'genre', type: 'text', required: true }] },
    { name: 'description', type: 'richText' },
    {
      name: 'youtubeId',
      type: 'text',
      admin: { description: 'The part after v= in the YouTube URL.' },
    },
    { name: 'spotifyUrl', type: 'text' },
    { name: 'appleMusicUrl', type: 'text' },
    { name: 'hyperfollowUrl', type: 'text', label: 'Hyperfollow URL (all platforms)' },
    { name: 'extraLinks', type: 'array', fields: linkFields },
    {
      name: 'tracklist',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', required: true },
        { name: 'duration', type: 'text', admin: { description: 'e.g. 3:45' } },
      ],
    },
    { name: 'featured', type: 'checkbox', defaultValue: false, admin: { position: 'sidebar' } },
    { name: 'published', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
