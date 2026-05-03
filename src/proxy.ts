import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import type { Database } from '@/types/supabase'

const PLATFORM_DOMAIN = process.env.NEXT_PUBLIC_PLATFORM_DOMAIN ?? 'yourplatform.com'

// Paths that should never trigger tenant resolution
const BYPASS_PREFIXES = ['/_next', '/api', '/dashboard', '/login', '/signup']

function shouldBypass(pathname: string) {
  return (
    pathname === '/favicon.ico' ||
    BYPASS_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))
  )
}

export async function proxy(request: NextRequest) {
  const hostname = request.headers.get('host') ?? ''
  const { pathname } = request.nextUrl

  // Always refresh the Supabase auth session on every request
  let response = NextResponse.next({ request })
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()

  if (shouldBypass(pathname)) return response

  // Strip port for local dev (localhost:3000 → localhost)
  const cleanHost = hostname.split(':')[0]
  const isPlatformHost =
    cleanHost === PLATFORM_DOMAIN ||
    cleanHost === 'localhost' ||
    cleanHost === '127.0.0.1' ||
    cleanHost.endsWith('.vercel.app') // preview deployments

  if (isPlatformHost) {
    const tenantParam = request.nextUrl.searchParams.get('_tenant')
    // Fall back to the session cookie set on a previous ?_tenant= visit so that
    // relative links (/products, /checkout, etc.) keep working without the param.
    const cookieTenant = request.cookies.get('x-storefront-tenant')?.value
    const subdomain = tenantParam ?? (pathname !== '/' ? cookieTenant : null)

    if (subdomain) {
      const { data } = await supabase
        .from('merchants')
        .select('id')
        .eq('subdomain', subdomain)
        .maybeSingle()
      if (data) {
        const rewriteUrl = request.nextUrl.clone()
        rewriteUrl.pathname = `/${data.id}${pathname}`
        const res = NextResponse.rewrite(rewriteUrl, { headers: response.headers })
        // Stamp the cookie whenever the param is explicitly present so it stays fresh.
        if (tenantParam) {
          res.cookies.set('x-storefront-tenant', tenantParam, {
            path: '/',
            sameSite: 'lax',
            httpOnly: true,
            // Session cookie — clears when browser closes, keeping stores isolated.
          })
        }
        return res
      }
    }
    return response
  }

  let tenantId: string | null = null

  // 1. Custom domain match (e.g. cool-kicks.com)
  const { data: byCustomDomain } = await supabase
    .from('merchants')
    .select('id')
    .eq('custom_domain', cleanHost)
    .maybeSingle()

  if (byCustomDomain) {
    tenantId = byCustomDomain.id
  } else if (cleanHost.endsWith(`.${PLATFORM_DOMAIN}`)) {
    // 2. Subdomain match (e.g. cool-kicks.yourplatform.com → "cool-kicks")
    const subdomain = cleanHost.slice(0, -(PLATFORM_DOMAIN.length + 1))
    if (subdomain) {
      const { data: bySubdomain } = await supabase
        .from('merchants')
        .select('id')
        .eq('subdomain', subdomain)
        .maybeSingle()
      if (bySubdomain) tenantId = bySubdomain.id
    }
  }

  if (!tenantId) return response

  // Rewrite to /{tenantId}/... without changing the URL the user sees
  const rewriteUrl = request.nextUrl.clone()
  rewriteUrl.pathname = `/${tenantId}${pathname}`
  return NextResponse.rewrite(rewriteUrl, { headers: response.headers })
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
