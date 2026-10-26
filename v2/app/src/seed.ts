/**
 * Idempotent import of the real content: `pnpm seed` (upserts by slug, safe to re-run).
 * Source data lives in ../seed/data.json and ../seed/img, so it works offline.
 */
import path from 'path'
import { getPayload } from 'payload'
import { fileURLToPath } from 'url'

import config from './payload.config'
import { seed } from './seed/run'

const seedDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../seed')
const payload = await getPayload({ config })

await seed(payload, { imgDir: path.join(seedDir, 'img') })

process.exit(0)
