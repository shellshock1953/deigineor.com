import { NextResponse, type NextRequest } from 'next/server'

// Real server action ids are long hex hashes; scanners send junk like "x", which makes Next log
// "The Server Reference ID did not match the expected format" on every hit.
export function isBogusServerAction(nextAction: string | null): boolean {
  return nextAction !== null && !/^[0-9a-f]{40,}$/i.test(nextAction)
}

// Crawlers scrape URLs out of the escaped RSC payload, so the filename ends with a backslash.
export function isEscapedMediaPath(pathname: string): boolean {
  return pathname.startsWith('/api/media/file/') && /(\\|%5c)$/i.test(pathname)
}

export function proxy(request: NextRequest) {
  if (
    isBogusServerAction(request.headers.get('next-action')) ||
    isEscapedMediaPath(request.nextUrl.pathname)
  ) {
    return new Response(null, { status: 404 })
  }
  return NextResponse.next()
}

export const config = {
  // Media paths contain a dot, so they need their own entry next to the catch-all that skips assets.
  matcher: ['/api/media/file/:path*', '/((?!_next/static|_next/image|.*\\..*).*)'],
}
