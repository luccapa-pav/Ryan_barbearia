import { createClient } from '@/lib/supabase/server'
import { ClientesPageClient } from './clientes-client'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 60

export default async function ClientesPage() {
  const supabase = await createClient()

  const [clientesResult, agendResult] = await Promise.all([
    supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true }),
    supabase
      .from('agendamentos')
      .select('cliente_id, status, data_hora, servicos (id, nome, preco)')
      .order('data_hora', { ascending: false }),
  ])

  return (
    <ClientesPageClient
      clientes={clientesResult.data ?? []}
      agendamentos={(agendResult.data ?? []) as unknown as AgendamentoComRelacoes[]}
    />
  )
}
