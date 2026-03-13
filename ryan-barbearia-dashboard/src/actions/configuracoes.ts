'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { HorarioTrabalhoUpdate, BloqueioInsert } from '@/lib/supabase/types'

export async function salvarConfiguracoes(configuracoes: Record<string, string>) {
  const supabase = await createClient()

  const upserts = Object.entries(configuracoes).map(([chave, valor]) => ({
    chave,
    valor,
  }))

  const { error } = await supabase
    .from('configuracoes')
    .upsert(upserts, { onConflict: 'chave' })

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function atualizarHorario(id: string, data: HorarioTrabalhoUpdate) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('horarios_trabalho')
    .update(data)
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true }
}

export async function criarBloqueio(data: BloqueioInsert) {
  const supabase = await createClient()

  const { data: bloqueio, error } = await supabase
    .from('bloqueios')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true, data: bloqueio }
}

export async function deletarBloqueio(id: string) {
  const supabase = await createClient()

  const { error } = await supabase
    .from('bloqueios')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true }
}
