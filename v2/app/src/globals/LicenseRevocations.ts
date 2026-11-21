import type { GlobalConfig } from 'payload'
import { isAuthed } from '../fields'

// Served as-is at /librarium/revoked.json; written only by the Paddle webhook.
export const LicenseRevocations: GlobalConfig = {
  slug: 'license-revocations',
  label: 'Licence revocations',
  access: { read: isAuthed, update: isAuthed },
  fields: [
    { name: 'revokedJson', type: 'textarea', admin: { readOnly: true, description: 'Current signed revoked.json.' } },
  ],
}
