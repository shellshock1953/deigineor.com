import { formatDate } from '../lib/format'
import { OS_NAME, OSES, type Latest, type Os } from '../lib/download/studio'

const PREVIOUS_COUNT = 4

/** Collapsed list of the releases before the latest (`releases` is newest first); each OS links only if that release ships it. */
export function PreviousVersions({
  releases,
  zip,
  href,
}: {
  releases: Latest[]
  zip: 'assets' | 'player'
  href: (version: string, os: Os) => string
}) {
  const previous = releases.slice(1, 1 + PREVIOUS_COUNT)
  if (!previous.length) return null
  return (
    <details className="previous-versions">
      <summary className="mono">Previous versions</summary>
      <ul>
        {previous.map((r) => (
          <li key={r.version} className="mono">
            {r.version} · {formatDate(r.published)}
            {OSES.filter((os) => r[zip][os]).map((os) => (
              <span key={os}>
                {' · '}
                <a href={href(r.version, os)}>{OS_NAME[os]}</a>
              </span>
            ))}
          </li>
        ))}
      </ul>
      <p className="mono">Older versions may not open libraries made with newer Studio.</p>
    </details>
  )
}
