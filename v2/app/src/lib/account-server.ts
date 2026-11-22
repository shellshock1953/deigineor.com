import { cookies } from 'next/headers'
import { getPayload } from 'payload'
import config from '@payload-config'

import { SESSION_COOKIE, verifyToken } from './account'

/** Email of the signed-in buyer (valid `dg_session` cookie), or null. */
export async function sessionEmail(): Promise<string | null> {
  return verifyToken('session', (await cookies()).get(SESSION_COOKIE)?.value)
}

/** All licences bought with this (normalised) email, newest first. */
export async function licensesFor(email: string) {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'licenses',
    where: { email: { equals: email } },
    sort: '-createdAt',
    limit: 200,
    pagination: false,
    depth: 0,
  })
  return docs
}
