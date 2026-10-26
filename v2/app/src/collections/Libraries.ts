import type { CollectionConfig } from 'payload'
import { isAuthed, linkFields, publishedOrAuthed, slugField } from '../fields'
import { revalidateSite } from '../lib/revalidate'

export const Libraries: CollectionConfig = {
  slug: 'libraries',
  labels: { singular: 'Instrument or plugin', plural: 'Instruments & Plugins' },
  admin: {
    useAsTitle: 'title',
    defaultColumns: ['title', 'kind', 'pricing', 'order', 'published'],
  },
  defaultSort: 'order',
  access: { read: publishedOrAuthed, create: isAuthed, update: isAuthed, delete: isAuthed },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: 'title', type: 'text', required: true },
    slugField,
    { name: 'tagline', type: 'text' },
    { name: 'description', type: 'richText' },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'kind',
      type: 'select',
      required: true,
      defaultValue: 'sample-library',
      options: [
        { label: 'Sample library', value: 'sample-library' },
        { label: 'Plugin', value: 'plugin' },
      ],
    },
    {
      name: 'pricing',
      type: 'select',
      required: true,
      defaultValue: 'free',
      options: [
        { label: 'Free', value: 'free' },
        { label: 'Paid', value: 'paid' },
      ],
    },
    {
      name: 'price',
      type: 'number',
      min: 0,
      admin: { condition: (data) => data?.pricing === 'paid' },
      validate: (value: number | null | undefined, { data }: { data: { pricing?: string } }) =>
        data?.pricing === 'paid' && value == null ? 'Price is required for paid items.' : true,
    },
    {
      name: 'currency',
      type: 'select',
      defaultValue: 'USD',
      options: ['USD', 'EUR', 'UAH'],
      admin: { condition: (data) => data?.pricing === 'paid' },
    },
    {
      name: 'buyUrl',
      type: 'text',
      admin: {
        description: 'External checkout link (any payment provider).',
        condition: (data) => data?.pricing === 'paid',
      },
    },
    {
      name: 'platforms',
      type: 'array',
      fields: [{ name: 'platform', type: 'text', required: true }],
      admin: { description: 'e.g. VST3, AU, Kontakt' },
    },
    { name: 'version', type: 'text' },
    { name: 'format', type: 'text', admin: { description: 'e.g. Kontakt (full version)' } },
    {
      name: 'downloadUrl',
      type: 'text',
      admin: { description: 'Direct download link for free items.' },
    },
    { name: 'demoLinks', type: 'array', fields: linkFields },
    { name: 'collaborator', type: 'text' },
    { name: 'order', type: 'number', defaultValue: 0, admin: { position: 'sidebar' } },
    { name: 'published', type: 'checkbox', defaultValue: true, admin: { position: 'sidebar' } },
  ],
}
