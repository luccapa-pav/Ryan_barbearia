'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

export async function registrarLogin(email: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const headersList = await headers()
    const userAgent = headersList.get('user-agent') ?? null
    const forwardedFor = headersList.get('x-forwarded-for')
    const ip = forwardedFor ? forwardedFor.split(',')[0]!.trim() : headersList.get('x-real-ip') ?? null

    await supabase.from('logs_login').insert({
      user_id: user.id,
      email,
      ip,
      user_agent: userAgent,
    })
  } catch {
    // Falha silenciosa — não bloqueia o login
  }
}
