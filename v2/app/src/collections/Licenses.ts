import type { CollectionConfig } from 'payload'
import { isAuthed } from '../fields'

// Issued by the Paddle webhook (src/app/api/paddle/webhook). Never public: the buyer gets the file via /api/licence/<txn>.
export const Licenses: CollectionConfig = {
  slug: 'licenses',
  labels: { singular: 'Licence', plural: 'Licences' },
  admin: { useAsTitle: 'txn', defaultColumns: ['txn', 'email', 'product', 'status', 'createdAt'] },
  access: { read: isAuthed, create: isAuthed, update: isAuthed, delete: isAuthed },
  fields: [
    { name: 'txn', type: 'text', required: true, unique: true, index: true },
    { name: 'product', type: 'text', required: true },
    { name: 'name', type: 'text', required: true },
    { name: 'email', type: 'email', required: true },
    { name: 'licence', type: 'textarea', required: true, admin: { description: 'The Librarium.lic file content.' } },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'active',
      options: ['active', 'revoked'],
    },
    { name: 'paddleCustomerId', type: 'text' },
  ],
}
