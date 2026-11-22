import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { SESSION_COOKIE, verifyToken } from './account'
import { flagsReady } from './flags'
import { effectiveStatus, ensureTesterLicences } from './testers'

/** Email of the signed-in buyer (valid `dg_session` cookie), or null. */
export async function sessionEmail(): Promise<string | null> {
  return verifyToken('session', (await cookies()).get(SESSION_COOKIE)?.value)
}

/** All licences bought with this (normalised) email, newest first. Tester rows are created on demand and carry their flag-driven status. */
export async function licensesFor(email: string) {
  await flagsReady()
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'licenses',
    where: { email: { equals: email } },
    sort: '-createdAt',
    limit: 200,
    pagination: false,
    depth: 0,
  })
  const created = await ensureTesterLicences(payload, email, new Set(docs.map((d) => d.txn)))
  return [...created, ...docs].flatMap((d) => {
    const status = effectiveStatus(d)
    return status ? [{ ...d, status }] : []
  })
}
