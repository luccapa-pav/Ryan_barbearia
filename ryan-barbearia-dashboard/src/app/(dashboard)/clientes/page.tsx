import { createClient } from '@/lib/supabase/server'
import { ClientesPageClient } from './clientes-client'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const revalidate = 60

export default async function ClientesPage() {
  const supabase = await createClient()

  const [clientesResult, agendResult, crmResult] = await Promise.all([
    supabase
      .from('clientes')
      .select('*')
      .order('nome', { ascending: true }),
    supabase
      .from('agendamentos')
      .select('cliente_id, status, data_hora, servicos (id, nome, preco)')
      .order('data_hora', { ascending: false }),
    supabase
      .from('ryan_gomes_barbearia')
      .select('whatsapp, quantidade_cortes, gasto_total, servico_habitual, resumo_perfil_cliente'),
  ])

  return (
    <ClientesPageClient
      clientes={clientesResult.data ?? []}
      agendamentos={(agendResult.data ?? []) as unknown as AgendamentoComRelacoes[]}
      crmData={crmResult.data ?? []}
    />
  )
}
