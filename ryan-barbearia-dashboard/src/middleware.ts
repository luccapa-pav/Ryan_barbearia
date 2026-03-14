import { createServerClient } from '@supabase/ssr'
import { type NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: Record<string, unknown> }>) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()

  const { pathname } = request.nextUrl

  const isPublicAuthRoute = ['/login', '/cadastro', '/aguardando', '/recusado'].some(p => pathname.startsWith(p))
  const isWebhookRoute    = pathname.startsWith('/api/webhooks')

  if (!user && !isPublicAuthRoute && !isWebhookRoute) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && !isPublicAuthRoute && !isWebhookRoute) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('status, role')
      .eq('user_id', user.id)
      .single()

    if (!perfil || perfil.status === 'pendente') {
      if (!pathname.startsWith('/aguardando')) {
        return NextResponse.redirect(new URL('/aguardando', request.url))
      }
    } else if (perfil.status === 'recusado') {
      if (!pathname.startsWith('/recusado')) {
        return NextResponse.redirect(new URL('/recusado', request.url))
      }
    } else if (perfil.role !== 'admin' && pathname.startsWith('/admin')) {
      return NextResponse.redirect(new URL('/visao-geral', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
