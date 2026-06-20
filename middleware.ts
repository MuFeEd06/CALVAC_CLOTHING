import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const isProduction = process.env.NODE_ENV === 'production'

function envOrigin(value: string | undefined) {
  if (!value) return ''
  try {
    return new URL(value).origin
  } catch {
    return ''
  }
}

function applySecurityHeaders(res: NextResponse, req: NextRequest) {
  const supabaseOrigin = envOrigin(process.env.NEXT_PUBLIC_SUPABASE_URL)
  const imageKitOrigin = envOrigin(process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT)
  const scriptSrc = ["'self'", "'unsafe-inline'", 'https://checkout.razorpay.com']

  if (!isProduction) scriptSrc.push("'unsafe-eval'")

  const connectSrc = [
    "'self'",
    supabaseOrigin,
    supabaseOrigin ? supabaseOrigin.replace('https://', 'wss://') : '',
    'https://*.razorpay.com',
  ].filter(Boolean)
  const imgSrc = ["'self'", 'data:', 'blob:', 'https:', imageKitOrigin].filter(Boolean)
  const csp = [
    "default-src 'self'",
    "base-uri 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'",
    "form-action 'self'",
    `script-src ${scriptSrc.join(' ')}`,
    "style-src 'self' 'unsafe-inline'",
    "font-src 'self' data:",
    `img-src ${Array.from(new Set(imgSrc)).join(' ')}`,
    `connect-src ${Array.from(new Set(connectSrc)).join(' ')}`,
    'frame-src https://*.razorpay.com',
  ].join('; ')

  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

  if (isProduction && req.nextUrl.protocol === 'https:') {
    res.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  }

  return res
}

export async function middleware(req: NextRequest) {
  let res = NextResponse.next({ request: { headers: req.headers } })

  if (req.nextUrl.pathname.startsWith('/account')) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return applySecurityHeaders(res, req)
    }

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name) { return req.cookies.get(name)?.value },
        set(name, value, options) {
          req.cookies.set({ name, value, ...options })
          res = NextResponse.next({ request: { headers: req.headers } })
          res.cookies.set({ name, value, ...options })
        },
        remove(name, options) {
          req.cookies.set({ name, value: '', ...options })
          res = NextResponse.next({ request: { headers: req.headers } })
          res.cookies.set({ name, value: '', ...options })
        },
      },
    })

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      const loginUrl = new URL('/login', req.url)
      loginUrl.searchParams.set('redirect', req.nextUrl.pathname)
      return applySecurityHeaders(NextResponse.redirect(loginUrl), req)
    }
  }

  return applySecurityHeaders(res, req)
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
