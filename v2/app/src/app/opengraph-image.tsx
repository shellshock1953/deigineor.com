import { ImageResponse } from 'next/og'
import {
  WORDMARK_CUT_GAP,
  WORDMARK_PATH,
  WORDMARK_VIEWBOX,
  WORDMARK_WAVE,
} from '../components/logo-paths'

export const alt = 'DEIGINEOR — Ambition Music Development'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * Default Open Graph image: the wordmark on a near-black panel.
 * The letter shapes are plain SVG paths, so no font files are needed.
 */
export default function Image() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,
        background: '#07090a',
      }}
    >
      <svg viewBox={WORDMARK_VIEWBOX} width={1000} height={226}>
        <defs>
          <clipPath id="cut">
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
          fill="#e8e2d4"
          fillRule="evenodd"
          clipPath="url(#cut)"
        />
        <path
          d={WORDMARK_WAVE}
          fill="none"
          stroke="#9cff6b"
          strokeWidth={2.5}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          display: 'flex',
          color: '#9cff6b',
          fontFamily: 'monospace',
          fontSize: 26,
          letterSpacing: 14,
          textTransform: 'uppercase',
        }}
      >
        Ambition Music Development
      </div>
    </div>,
    size,
  )
}
