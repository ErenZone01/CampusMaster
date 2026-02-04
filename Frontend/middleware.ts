import { type NextRequest, NextResponse } from 'next/server'

/**
 * Middleware for mock authentication
 * In mock mode, authentication is handled client-side via localStorage
 * This middleware just passes through requests
 */
export async function middleware(request: NextRequest) {
  // In mock mode, we don't need server-side session management
  // Authentication is handled by AuthService with localStorage
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
