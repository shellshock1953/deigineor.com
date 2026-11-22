'use client'

import { useEffect, useState, type ReactNode } from 'react'

import type { PaddleConfig } from '../lib/paddle'

type Flags = { flags: string[]; paddle?: PaddleConfig }

// One /api/flags fetch per page load, shared by every gate and buy button. Never rejects: failure means no flags (fail open).
let cache: Promise<Flags> | undefined
function loadFlags(): Promise<Flags> {
  cache ??= fetch('/api/flags', { cache: 'no-store' })
    .then((r) => (r.ok ? (r.json() as Promise<Flags>) : { flags: [] }))
    .catch(() => ({ flags: [] }))
  return cache
}

/** The visitor's flags, or null until the first response arrives. */
export function useFlags(): Flags | null {
  const [flags, setFlags] = useState<Flags | null>(null)
  useEffect(() => {
    loadFlags().then(setFlags)
  }, [])
  return flags
}

/** Renders `children` only when the flag is on for this visitor; `fallback` otherwise. Nothing until flags have loaded. */
export default function FeatureGate({
  flag,
  fallback = null,
  children,
}: {
  flag: string
  fallback?: ReactNode
  children: ReactNode
}) {
  const f = useFlags()
  if (!f) return null
  return f.flags.includes(flag) ? children : fallback
}
