import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

// Placeholder: the real design comes in a later task.
export default async function Home() {
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'releases',
    sort: '-releaseDate',
    limit: 100,
    depth: 0,
    pagination: false,
  })

  return (
    <main>
      <h1>DEIGINEOR</h1>
      <ul>
        {docs.map((r) => (
          <li key={r.id}>
            <Link href={`/music/${r.slug}`}>{r.title}</Link> ({r.releaseDate.slice(0, 4)})
          </li>
        ))}
      </ul>
    </main>
  )
}
