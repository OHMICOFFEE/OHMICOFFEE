import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const adminAuth = request.cookies.get('ohmi_admin')?.value
  const repAuth = request.cookies.get('ohmi_rep')?.value

  // Public routes - no protection needed
  if (
    pathname === '/login' ||
    pathname === '/rep/login' ||
    pathname.startsWith('/join') ||
    pathname.startsWith('/api')
  ) {
    return NextResponse.next()
  }

  // Protect admin routes
  if (pathname.startsWith('/admin') && adminAuth !== 'authenticated') {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Protect rep portal routes
  if (pathname.startsWith('/rep/') && pathname.split('/').length > 3 && !repAuth) {
    return NextResponse.redirect(new URL('/rep/login', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/rep/:path*'],
}
