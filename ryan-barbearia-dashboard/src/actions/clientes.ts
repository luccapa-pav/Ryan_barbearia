'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ClienteInsert, ClienteUpdate } from '@/lib/supabase/types'

export async function criarCliente(data: ClienteInsert) {
  const supabase = await createClient()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .insert(data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'Já existe um cliente com esse telefone.' }
    }
    return { success: false, error: error.message }
  }

  revalidatePath('/clientes')
  return { success: true, data: cliente }
}

export async function atualizarCliente(id: string, data: ClienteUpdate) {
  const supabase = await createClient()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/clientes')
  return { success: true, data: cliente }
}
