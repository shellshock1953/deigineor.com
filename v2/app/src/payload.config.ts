import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import sharp from 'sharp'
import { fileURLToPath } from 'url'

import { Libraries } from './collections/Libraries'
import { Media } from './collections/Media'
import { Releases } from './collections/Releases'
import { Users } from './collections/Users'
import { Videos } from './collections/Videos'
import { Cv } from './globals/Cv'
import { Site } from './globals/Site'
import { migrations } from './migrations'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export default buildConfig({
  admin: { user: Users.slug, importMap: { baseDir: path.resolve(dirname) } },
  collections: [Users, Media, Releases, Videos, Libraries],
  globals: [Site, Cv],
  // Only the `cv` global has localized fields; everything else stays single-language.
  localization: { locales: ['en', 'uk'], defaultLocale: 'en' },
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URL },
    // Schema changes only through migrations (`pnpm migrate:create`, `pnpm migrate`).
    push: false,
    // Applied on boot in production (see instrumentation.ts); the standalone image has no payload CLI.
    prodMigrations: migrations,
  }),
  sharp,
})
