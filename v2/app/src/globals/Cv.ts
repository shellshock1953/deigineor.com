import type { GlobalConfig } from 'payload'
import { isAuthed } from '../fields'
import { revalidateSite } from '../lib/revalidate'

// Text is `localized` (en default, uk); contact data, photo and links are shared between locales.
export const Cv: GlobalConfig = {
  slug: 'cv',
  label: 'CV',
  access: { read: () => true, update: isAuthed },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: 'name', type: 'text', localized: true },
    { name: 'location', type: 'text', localized: true },
    { name: 'phone', type: 'text' },
    { name: 'email', type: 'email' },
    { name: 'website', type: 'text' },
    { name: 'photo', type: 'upload', relationTo: 'media' },
    { name: 'about', type: 'textarea', localized: true, admin: { description: 'Blank line between paragraphs.' } },
    {
      name: 'roles',
      label: 'Professional profile',
      type: 'array',
      fields: [{ name: 'text', type: 'text', localized: true, required: true }],
    },
    {
      name: 'education',
      type: 'array',
      fields: [
        { name: 'title', type: 'text', localized: true, required: true },
        { name: 'detail', type: 'text', localized: true },
      ],
    },
    {
      name: 'skills',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', localized: true, required: true },
        { name: 'items', type: 'text', localized: true, required: true },
      ],
    },
    {
      name: 'experience',
      type: 'array',
      fields: [{ name: 'text', type: 'text', localized: true, required: true }],
    },
    {
      name: 'links',
      type: 'array',
      fields: [
        { name: 'platform', type: 'text', required: true },
        { name: 'url', type: 'text', required: true },
      ],
    },
  ],
}
