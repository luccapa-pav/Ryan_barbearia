'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ServicoInsert, ServicoUpdate } from '@/lib/supabase/types'

export async function criarServico(data: ServicoInsert) {
  const supabase = await createClient()

  const { data: servico, error } = await supabase
    .from('servicos')
    .insert(data)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true, data: servico }
}

export async function atualizarServico(id: string, data: ServicoUpdate) {
  const supabase = await createClient()

  const { data: servico, error } = await supabase
    .from('servicos')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/configuracoes')
  return { success: true, data: servico }
}

export async function toggleServicoAtivo(id: string, ativo: boolean) {
  return atualizarServico(id, { ativo })
}
