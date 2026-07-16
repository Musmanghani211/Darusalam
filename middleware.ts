import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// Which sections each role is allowed into.
const roleAccess: Record<string, string[]> = {
  mohtamim: ['/dashboard', '/students', '/teachers', '/classes', '/attendance', '/fees', '/salary', '/income', '/expenses', '/reports', '/users', '/settings'],
  nazim: ['/dashboard', '/students', '/teachers', '/classes', '/attendance', '/fees', '/salary', '/funds', '/settings'],
  teacher: ['/dashboard', '/attendance', '/progress', '/profile'],
}

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const path = request.nextUrl.pathname

  const isPublic = path.startsWith('/login') || path.startsWith('/auth') || path.startsWith('/_next') || path.startsWith('/api') || path === '/favicon.ico'
  if (isPublic) return response

  if (!user) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status === 'Disabled') {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (path === '/') {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  const allowed = roleAccess[profile.role] || []
  const sectionAllowed = allowed.some(p => path.startsWith(p))
  if (!sectionAllowed) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
