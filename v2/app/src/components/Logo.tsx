import type { SVGProps } from 'react'

/**
 * Deigineor wordmark and compact mark, hand-crafted SVG geometry.
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

const WORDMARK_VIEWBOX = '0 0 1152 260'

/**
 * One waveform line across the full wordmark, centreline y=124.
 * 0..640: hand-placed organic bumps and gap transients.
 * 640..1152: clean sine (wavelength 64), amplitude tapering 6 -> 4.5.
 */
const WORDMARK_WAVE =
  'M0,124 C2.33,123.5 9.0,120.83 14,121 C19.0,121.17 24.67,125.33 30,125 C35.33,124.67 40.67,118.83 46,119 C51.33,119.17 56.67,125.83 62,126 C67.33,126.17 72.67,119.83 78,120 C83.33,120.17 88.67,127.17 94,127 C99.33,126.83 105.33,119.83 110,119 C114.67,118.17 119.33,123.67 122,122 C124.67,120.33 123.67,108.0 126,109 C128.33,110.0 131.67,126.0 136,128 C140.33,130.0 146.67,121.33 152,121 C157.33,120.67 162.67,126.5 168,126 C173.33,125.5 178.67,117.83 184,118 C189.33,118.17 194.67,126.67 200,127 C205.33,127.33 210.67,119.83 216,120 C221.33,120.17 226.67,127.67 232,128 C237.33,128.33 243.67,125.33 248,122 C252.33,118.67 255.33,108.5 258,108 C260.67,107.5 260.33,115.83 264,119 C267.67,122.17 274.67,126.83 280,127 C285.33,127.17 290.67,119.67 296,120 C301.33,120.33 306.67,128.83 312,129 C317.33,129.17 322.67,121.33 328,121 C333.33,120.67 338.67,127.33 344,127 C349.33,126.67 354.67,119.17 360,119 C365.33,118.83 371.67,122.5 376,126 C380.33,129.5 383.33,141.0 386,140 C388.67,139.0 388.33,122.0 392,120 C395.67,118.0 402.67,128.17 408,128 C413.33,127.83 418.67,119.17 424,119 C429.33,118.83 434.67,126.83 440,127 C445.33,127.17 450.67,119.83 456,120 C461.33,120.17 466.67,127.67 472,128 C477.33,128.33 482.67,122.17 488,122 C493.33,121.83 500.0,125.0 504,127 C508.0,129.0 509.33,135.17 512,134 C514.67,132.83 516.0,121.17 520,120 C524.0,118.83 530.67,126.67 536,127 C541.33,127.33 546.67,121.83 552,122 C557.33,122.17 562.67,128.33 568,128 C573.33,127.67 578.67,120.33 584,120 C589.33,119.67 594.67,125.83 600,126 C605.33,126.17 610.67,121.0 616,121 C621.33,121.0 628.0,124.5 632,126 C636.0,127.5 633.33,131.32 640,130.0 C646.67,128.68 661.33,118.13 672,118.09 C682.67,118.06 693.33,129.78 704,129.81 C714.67,129.84 725.33,118.31 736,118.28 C746.67,118.25 757.33,129.59 768,129.62 C778.67,129.66 789.33,118.5 800,118.47 C810.67,118.44 821.33,129.41 832,129.44 C842.67,129.47 853.33,118.69 864,118.66 C874.67,118.62 885.33,129.22 896,129.25 C906.67,129.28 917.33,118.88 928,118.84 C938.67,118.81 949.33,129.03 960,129.06 C970.67,129.09 981.33,119.06 992,119.03 C1002.67,119.0 1013.33,128.84 1024,128.88 C1034.67,128.91 1045.33,119.25 1056,119.22 C1066.67,119.19 1077.33,128.66 1088,128.69 C1098.67,128.72 1109.33,119.44 1120,119.41 C1130.67,119.37 1146.67,126.98 1152,128.5'

const MARK_VIEWBOX = '0 0 64 64'
const MARK_WAVE =
  'M3,31 C3.83,30.58 6.33,28.25 8,28.5 C9.67,28.75 11.33,32.42 13,32.5 C14.67,32.58 16.33,29.08 18,29 C19.67,28.92 21.33,32.17 23,32 C24.67,31.83 26.17,27.98 28,28 C29.83,28.02 31.0,31.78 34,32.1 C37.0,32.42 42.0,29.9 46,29.9 C50.0,29.9 56.0,31.73 58,32.1'

/**
 * The 9 letterforms in letter-local coordinates (116 wide x 160 tall),
 * drawn inside a group translated to the letter's slot and clipped to two
 * horizontal strips (local y 0..72 and 88..160) so the wave line runs
 * through the cut band (72..88). Letters: D E I G I N E O R.
 */
const LETTERS: string[] = [
  // D — stem plus half-round bowl (outer + counter, evenodd)
  'M0,0 H86 A30,30 0 0 1 116,30 L116,130 A30,30 0 0 1 86,160 L0,160 Z M22,22 H70 A22,22 0 0 0 92,44 L92,116 A22,22 0 0 0 70,138 L22,138 Z',
  // E — stem and three arms (the middle arm slightly shorter)
  'M0,0 H22 V160 H0 Z M22,0 H116 V22 H22 Z M22,46 H94 V68 H22 Z M22,138 H116 V160 H22 Z',
  // I — full-width top and bottom bars around a centred stem
  'M0,0 H116 V22 H0 Z M49,22 H67 V138 H49 Z M0,138 H116 V160 H0 Z',
  // G — bowl with an inward bar at the top strip (outer + bar + counter)
  'M0,0 H86 A30,30 0 0 1 116,30 L116,130 A30,30 0 0 1 86,160 L0,160 Z M66,46 H116 V68 H66 Z M22,22 H70 A22,22 0 0 0 92,44 L92,46 L22,46 Z',
  // I (same as above)
  'M0,0 H116 V22 H0 Z M49,22 H67 V138 H49 Z M0,138 H116 V160 H0 Z',
  // N — two stems joined by a slanted diagonal
  'M0,0 H22 V160 H0 Z M94,0 H116 V160 H94 Z M22,0 H66 L116,160 H72 Z',
  // E (same as above)
  'M0,0 H22 V160 H0 Z M22,0 H116 V22 H22 Z M22,46 H94 V68 H22 Z M22,138 H116 V160 H22 Z',
  // O — symmetric ring, slightly inset so it doesn't read as the D
  'M22,0 H86 A30,30 0 0 1 116,30 L116,130 A30,30 0 0 1 86,160 L22,160 Z M46,22 H70 A22,22 0 0 0 92,44 L92,116 A22,22 0 0 0 70,138 L46,138 Z',
  // R — bowl with counter, leg from the bowl's bottom right
  'M0,0 H22 V160 H0 Z M22,0 H86 A30,30 0 0 1 116,30 L116,64 L22,64 Z M46,22 H70 A22,22 0 0 0 92,44 L92,64 L46,64 Z M64,64 H104 L116,160 H84 Z',
]

/** Two horizontal strips: cuts the band the wave runs through. */
const LETTER_CLIP = (
  <>
    <rect x={0} y={0} width={116} height={72} />
    <rect x={0} y={88} width={116} height={72} />
  </>
)

function LetterShapes() {
  return (
    <>
      {LETTERS.map((d, i) => (
        <g key={i} transform={`translate(${8 + i * 128}, 44)`} clipPath={`url(#${'deig-letter-cut'})`}>
          <path d={d} fillRule="evenodd" fill="currentColor" />
        </g>
      ))}
    </>
  )
}

/**
 * Full wordmark "DEIGINEOR". Renders at the viewBox aspect (1152x260);
 * size it with CSS (width/font-size) — e.g. `width: min(88vw, 1200px)`.
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
        <clipPath id="deig-letter-cut">{LETTER_CLIP}</clipPath>
      </defs>
      <LetterShapes />
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
          <rect x={0} y={8} width={58} height={19} />
          <rect x={0} y={35} width={58} height={21} />
        </clipPath>
      </defs>
      <g clipPath="url(#deig-mark-cut)">
        <path
          d="M5,8 H36 A14,14 0 0 1 50,22 L50,42 A14,14 0 0 1 36,56 L5,56 Z M14,17 H30 A10,10 0 0 0 40,27 L40,37 A10,10 0 0 0 30,47 L14,47 Z"
          fillRule="evenodd"
          fill="currentColor"
        />
      </g>
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
