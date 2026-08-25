import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
const PROTECTED = ['/dashboard', '/mrv', '/ledger', '/profile']
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isProtected = PROTECTED.some(p => pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()
  const token = request.cookies.get('carbonx_token')?.value
  if (!token) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }
  return NextResponse.next()
}
export const config = { matcher: ['/dashboard/:path*', '/mrv/:path*', '/ledger/:path*', '/profile/:path*'] }
