'use server'

import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

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

export async function cadastrarPerfil({ nome, email }: { nome: string; email: string }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Usuário não autenticado')

  const { error } = await supabase.from('perfis').insert({
    user_id: user.id,
    nome,
    email,
    role: 'usuario',
    status: 'pendente',
  })

  if (error) throw new Error(error.message)
}

export async function aprovarUsuario(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('perfis')
    .update({ status: 'ativo' })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function recusarUsuario(userId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('perfis')
    .update({ status: 'recusado' })
    .eq('user_id', userId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin')
}

export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
