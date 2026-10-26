import type { CollectionConfig } from 'payload'
import { isAuthed } from '../fields'

export const Users: CollectionConfig = {
  slug: 'users',
  admin: { useAsTitle: 'email' },
  auth: true,
  access: { read: isAuthed, create: isAuthed, update: isAuthed, delete: isAuthed, admin: isAuthed },
  fields: [],
}
