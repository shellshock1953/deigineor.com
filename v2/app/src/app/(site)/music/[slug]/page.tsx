import config from '@payload-config'
import { notFound } from 'next/navigation'
import { getPayload } from 'payload'

export const dynamic = 'force-dynamic'

// Placeholder: the real design comes in a later task.
export default async function Release({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const { docs } = await payload.find({
    collection: 'releases',
    where: { slug: { equals: slug } },
    limit: 1,
    depth: 0,
  })
  const r = docs[0]
  if (!r) notFound()

  const links = [
    ['Spotify', r.spotifyUrl],
    ['Apple Music', r.appleMusicUrl],
    ['All platforms', r.hyperfollowUrl],
    ['YouTube', r.youtubeId && `https://www.youtube.com/watch?v=${r.youtubeId}`],
    ...(r.extraLinks ?? []).map((l) => [l.label, l.url]),
  ].filter((l): l is [string, string] => Boolean(l[1]))

  return (
    <main>
      <h1>{r.title}</h1>
      <p>
        {r.kind} · {r.releaseDate.slice(0, 10)}
      </p>
      <ul>
        {links.map(([label, url]) => (
          <li key={label}>
            <a href={url} rel="noopener">
              {label}
            </a>
          </li>
        ))}
      </ul>
    </main>
  )
}
