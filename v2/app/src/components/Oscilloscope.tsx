'use client'

import { useEffect, useRef } from 'react'

/**
 * Animated oscilloscope strip for the hero: a trace that slowly morphs from
 * a noisy organic line (the forest) into a clean sine (the signal) and back.
 *
 * - requestAnimationFrame only while the canvas is on screen and the tab is visible
 * - static single frame under `prefers-reduced-motion`
 * - phosphor-style trail: each frame fades the previous one slightly
 */

const BG = 'rgba(7, 9, 10, 0.22)'

export default function Oscilloscope({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let raf = 0
    let running = false
    let start = 0
    let visible = true
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const rect = canvas.getBoundingClientRect()
      if (rect.width === 0) return
      width = Math.round(rect.width * dpr)
      height = Math.round(rect.height * dpr)
      canvas.width = width
      canvas.height = height
    }

    /** Trace y (CSS px) at x (0..1) for morph amount m: 0 = organic, 1 = clean sine. */
    const trace = (x: number, t: number, m: number): number => {
      const cy = height / 2
      const organic =
        Math.sin(x * 17 + t * 0.9 + 1.3) * 0.55 +
        Math.sin(x * 41 - t * 0.7 + 4.1) * 0.3 +
        Math.sin(x * 83 + t * 1.1) * 0.15
      // occasional transient spike wandering across the screen
      const spikeX = (t * 0.021) % 1
      const spike = Math.exp(-Math.pow((x - spikeX) / 0.006, 2)) * 0.9
      const sine = Math.sin(x * Math.PI * 4 + t * 0.6) * 0.45
      const amp = (1 - m) * 0.34 + m * 0.5
      const base = Math.max(6, height * 0.28) * amp
      const noise = organic * (1 - m) + sine * m + spike * (1 - m) * 0.9
      return cy + noise * base
    }

    const draw = (now: number) => {
      if (!running) return
      if (!start) start = now
      const t = (now - start) / 1000
      // morph 0 -> 1 -> 0 over ~28 s
      const phase = (t % 28) / 28
      const m = Math.min(1, phase * 2) * (1 - Math.max(0, phase - 0.5) * 2)

      ctx.fillStyle = BG
      ctx.fillRect(0, 0, width, height)
      ctx.lineWidth = Math.max(1.5, height * 0.02)
      ctx.strokeStyle = '#9cff6b'
      ctx.lineJoin = 'round'
      ctx.lineCap = 'round'
      ctx.beginPath()
      const steps = Math.max(120, Math.floor(width / 6))
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * width
        const y = trace(i / steps, t, m)
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()

      // glowing head dot at the leading edge of the sweep
      const headX = width * 0.86
      const headY = trace(0.86, t, m)
      ctx.save()
      ctx.shadowColor = '#9cff6b'
      ctx.shadowBlur = 10
      ctx.fillStyle = '#9cff6b'
      ctx.beginPath()
      ctx.arc(headX, headY, Math.max(2, height * 0.02), 0, Math.PI * 2)
      ctx.fill()
      ctx.restore()

      raf = requestAnimationFrame(draw)
    }

    const renderStatic = () => {
      // One quiet sine, no animation.
      ctx.fillStyle = 'rgba(7, 9, 10, 0)'
      ctx.clearRect(0, 0, width, height)
      ctx.lineWidth = Math.max(1.5, height * 0.02)
      ctx.strokeStyle = '#9cff6b'
      ctx.lineJoin = 'round'
      ctx.beginPath()
      const cy = height / 2
      for (let i = 0; i <= 240; i++) {
        const x = (i / 240) * width
        const y = cy + Math.sin((i / 240) * Math.PI * 4) * height * 0.2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      }
      ctx.stroke()
    }

    const pause = () => {
      running = false
      cancelAnimationFrame(raf)
    }
    const resume = () => {
      if (reduce || !visible || running) return
      running = true
      start = 0
      raf = requestAnimationFrame(draw)
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting
        if (visible) resume()
        else pause()
      },
      { threshold: 0 },
    )
    io.observe(canvas)

    const onVisibility = () => {
      if (document.hidden) pause()
      else resume()
    }
    document.addEventListener('visibilitychange', onVisibility)

    const ro = new ResizeObserver(() => {
      resize()
      if (reduce) renderStatic()
    })
    ro.observe(canvas)

    resize()
    if (reduce) renderStatic()
    else resume()

    return () => {
      pause()
      io.disconnect()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
