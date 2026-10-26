import type { SVGProps } from 'react'
import {
  LETTERS,
  MARK_CUT_GAP,
  MARK_D_PATH,
  MARK_VIEWBOX,
  MARK_WAVE,
  WORDMARK_CUT_GAP,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
  WORDMARK_WAVE,
} from './logo-paths'

export {
  LETTERS,
  MARK_CUT_GAP,
  MARK_D_PATH,
  MARK_VIEWBOX,
  MARK_WAVE,
  WORDMARK_CUT_GAP,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
  WORDMARK_WAVE,
}

/**
 * Deigineor wordmark and compact mark, built from real Unbounded font outlines.
 *
 * Concept "Field -> Signal": wide display letterforms with a single
 * oscilloscope line running through the horizontal middle of the letters —
 * irregular/organic on the left (the forest), a clean decaying sine on the
 * right (the signal). Letters are clipped into a top and a bottom strip so
 * the line visibly "cuts" through them.
 *
 * Colors: letters use `currentColor`; the wave line uses the phosphor
 * accent (`var(--accent)` in CSS, `#9cff6b` in standalone SVGs).
 */

export function Wordmark({
  className,
  title,
  ...rest
}: { className?: string; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={WORDMARK_VIEWBOX}
      className={className}
      role="img"
      aria-label={title ?? 'DEIGINEOR'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <defs>
        <clipPath id="deig-letter-cut">
          <rect x={0} y={0} width={1152} height={WORDMARK_CUT_GAP.top} />
          <rect
            x={0}
            y={WORDMARK_CUT_GAP.bottom}
            width={1152}
            height={260 - WORDMARK_CUT_GAP.bottom}
          />
        </clipPath>
      </defs>
      <path
        d={WORDMARK_PATH}
        fill="currentColor"
        fillRule="evenodd"
        clipPath="url(#deig-letter-cut)"
      />
      <path
        d={WORDMARK_WAVE}
        fill="none"
        stroke="var(--accent, #9cff6b)"
        strokeWidth={2.5}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}

/** Compact "D + wave" mark for the header / favicon (square viewBox). */
export function LogoMark({
  className,
  title,
  ...rest
}: { className?: string; title?: string } & SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox={MARK_VIEWBOX}
      className={className}
      role="img"
      aria-label={title ?? 'DEIGINEOR'}
      xmlns="http://www.w3.org/2000/svg"
      {...rest}
    >
      <defs>
        <clipPath id="deig-mark-cut">
          <rect x={0} y={0} width={64} height={MARK_CUT_GAP.top} />
          <rect
            x={0}
            y={MARK_CUT_GAP.bottom}
            width={64}
            height={64 - MARK_CUT_GAP.bottom}
          />
        </clipPath>
      </defs>
      <path
        d={MARK_D_PATH}
        fill="currentColor"
        fillRule="evenodd"
        clipPath="url(#deig-mark-cut)"
      />
      <path
        d={MARK_WAVE}
        fill="none"
        stroke="var(--accent, #9cff6b)"
        strokeWidth={1.8}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  )
}
