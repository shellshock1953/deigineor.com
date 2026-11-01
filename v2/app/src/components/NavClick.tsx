'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef } from 'react'

/**
 * Plays a short click every time the visitor lands on another page of the site.
 *
 * - silent on the first page load (browsers block audio before any interaction anyway)
 * - fires on pathname changes only, so back/forward counts and query or #hash changes do not
 * - one preloaded element, rewound on each play, so rapid navigation never stacks clicks
 */

const SRC = '/sounds/nav-click.mp3'
const VOLUME = 0.5

export default function NavClick() {
  const pathname = usePathname()
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const lastPathRef = useRef(pathname)

  useEffect(() => {
    const audio = new Audio(SRC)
    audio.preload = 'auto'
    audio.volume = VOLUME
    audioRef.current = audio
    return () => {
      audio.pause()
      audioRef.current = null
    }
  }, [])

  useEffect(() => {
    if (pathname === lastPathRef.current) return
    lastPathRef.current = pathname
    const audio = audioRef.current
    if (!audio) return
    audio.currentTime = 0
    // Rejected when the browser has not seen a user gesture yet; a missed click is fine.
    audio.play().catch(() => {})
  }, [pathname])

  return null
}
