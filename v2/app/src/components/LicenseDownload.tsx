'use client'

import { useEffect, useState, type ReactNode } from 'react'

type Buyer = { name: string; email: string }

const POLL_MS = 2000
const MAX_TRIES = 30 // ~60 s, the webhook normally lands within seconds

/** Polls for the licence the Paddle webhook issues, then offers the download and install steps. */
export default function LicenseDownload({ txn, contact }: { txn: string; contact: ReactNode }) {
  const [buyer, setBuyer] = useState<Buyer | null>(null)
  const [gaveUp, setGaveUp] = useState(false)

  useEffect(() => {
    let stop = false
    let timer: ReturnType<typeof setTimeout>
    const poll = async (n: number) => {
      try {
        const res = await fetch(`/api/licence/${txn}`, { cache: 'no-store' })
        if (res.ok) {
          const lic = JSON.parse((await res.json()).payload) as Buyer
          if (!stop) setBuyer({ name: lic.name, email: lic.email })
          return
        }
      } catch {
        // 404 until issued; network blips just retry
      }
      if (stop) return
      if (n + 1 >= MAX_TRIES) setGaveUp(true)
      else timer = setTimeout(() => poll(n + 1), POLL_MS)
    }
    poll(0)
    return () => {
      stop = true
      clearTimeout(timer)
    }
  }, [txn])

  if (!buyer) {
    return (
      <p role="status" aria-live="polite">
        {gaveUp ? (
          <>
            Your licence is taking longer than expected. Reload this page in a minute, or contact us at {contact}.
          </>
        ) : (
          'Preparing your licence…'
        )}
      </p>
    )
  }

  return (
    <>
      <p role="status" aria-live="polite">
        Licensed to {buyer.name} &lt;{buyer.email}&gt;
      </p>
      <p>
        <a className="btn btn--primary" href={`/api/licence/${txn}`} download="Librarium.lic">
          Download Librarium.lic
        </a>
      </p>
      <h2>Install</h2>
      <ol>
        <li>Open Librarium Studio and drop <code>Librarium.lic</code> on its window, or click the red bar at the top.</li>
        <li>
          Or copy the file to the Librarium config folder:
          <ul>
            <li>Windows: <code>%APPDATA%\Librarium</code></li>
            <li>macOS: <code>~/Library/Application Support/Librarium</code></li>
            <li>Linux: <code>$XDG_CONFIG_HOME/Librarium</code>, else <code>~/.config/Librarium</code></li>
          </ul>
        </li>
        <li>The licence works on any of your machines. Keep the file: this page shows it only while the order is active.</li>
      </ol>
      <h2>Librarium Studio download</h2>
      <p>Download link will be sent by e-mail.</p>
    </>
  )
}
