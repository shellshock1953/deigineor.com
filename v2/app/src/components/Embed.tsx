'use client'

import { useState } from 'react'

/**
 * Click-to-load embed facade: nothing third-party is requested until the
 * visitor activates the player. YouTube loads from youtube-nocookie.com.
 */

type EmbedProps =
  | { kind: 'youtube'; id: string; title: string; poster?: string | null }
  | { kind: 'spotify'; src: string; title: string; poster?: string | null }

export default function Embed(props: EmbedProps) {
  const [loaded, setLoaded] = useState(false)
  const { kind, title } = props
  const poster = props.poster

  if (loaded) {
    return (
      <div className="embed embed--live">
        {kind === 'youtube' ? (
          <iframe
            src={`https://www.youtube-nocookie.com/embed/${props.id}?autoplay=1&rel=0`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <iframe
            src={`${props.src}?theme=0`}
            title={title}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        )}
      </div>
    )
  }

  return (
    <button
      type="button"
      className={`embed embed--facade${poster ? ' embed--poster' : ''}`}
      onClick={() => setLoaded(true)}
      aria-label={`Play ${title} on ${kind === 'youtube' ? 'YouTube' : 'Spotify'}`}
    >
      {poster && (
        <span
          className="embed__poster"
          aria-hidden="true"
          style={{ backgroundImage: `url(${poster})` }}
        />
      )}
      <span className="embed__play" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
          <path d="M8 5.5v13l11-6.5z" />
        </svg>
      </span>
      <span className="embed__meta">
        <span className="embed__label">
          {kind === 'youtube' ? 'YT · LOAD PLAYER' : 'SPOTIFY · LOAD PLAYER'}
        </span>
        <span className="embed__title">{title}</span>
        <span className="embed__hint">Click to load — nothing loads from {kind === 'youtube' ? 'YouTube' : 'Spotify'} before that</span>
      </span>
    </button>
  )
}
