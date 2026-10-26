import type { GlobalConfig } from 'payload'
import { isAuthed } from '../fields'
import { revalidateSite } from '../lib/revalidate'

const platformFields = [
  { name: 'platform', type: 'text', required: true },
  { name: 'url', type: 'text', required: true },
] as const

export const Site: GlobalConfig = {
  slug: 'site',
  label: 'Site settings',
  access: { read: () => true, update: isAuthed },
  hooks: { afterChange: [() => revalidateSite()] },
  fields: [
    { name: 'tagline', type: 'text' },
    { name: 'shortBio', type: 'textarea' },
    { name: 'about', type: 'richText' },
    { name: 'platformLinks', type: 'array', fields: [...platformFields] },
    { name: 'socialLinks', type: 'array', fields: [...platformFields] },
    { name: 'contactEmail', type: 'email' },
  ],
}
