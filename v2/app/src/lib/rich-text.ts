import { convertLexicalToPlaintext } from '@payloadcms/richtext-lexical/plaintext'

type PlaintextArgs = Parameters<typeof convertLexicalToPlaintext>[0]

/** Payload rich text field -> plain text (whitespace-collapsed). */
export function plainText(rt: unknown): string {
  if (!rt || typeof rt !== 'object' || !('root' in rt)) return ''
  return convertLexicalToPlaintext({ data: rt as PlaintextArgs['data'] })
    .replace(/\s+/g, ' ')
    .trim()
}

/** First `max` characters of the rich text, with an ellipsis when truncated. */
export function excerpt(rt: unknown, max: number): string {
  const text = plainText(rt)
  return text.length > max ? `${text.slice(0, max).trimEnd()}…` : text
}
