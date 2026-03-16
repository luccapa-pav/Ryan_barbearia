'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { ClienteInsert, ClienteUpdate } from '@/lib/supabase/types'

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export async function criarCliente(data: ClienteInsert) {
  const nome = data.nome?.trim()
  if (!nome || nome.length < 2 || nome.length > 100) return { success: false, error: 'Nome inválido' }
  const digits = (data.telefone ?? '').replace(/\D/g, '')
  if (digits.length < 10 || digits.length > 11) return { success: false, error: 'Telefone inválido' }

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
  if (!UUID_RE.test(id)) return { success: false, error: 'id inválido' }

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
