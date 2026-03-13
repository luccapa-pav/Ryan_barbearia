import { createClient } from '@/lib/supabase/server'
import { AgendamentosPageClient } from './agendamentos-client'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

interface AgendamentosPageProps {
  searchParams: Promise<{
    status?: string
    data?: string
    pagina?: string
  }>
}

export default async function AgendamentosPage({ searchParams }: AgendamentosPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const pagina = parseInt(params.pagina ?? '1', 10)
  const pageSize = 20
  const offset = (pagina - 1) * pageSize

  let query = supabase
    .from('agendamentos')
    .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)', { count: 'exact' })
    .order('data_hora', { ascending: false })
    .range(offset, offset + pageSize - 1)

  if (params.status) query = query.eq('status', params.status)

  if (params.data) {
    const nextDay = new Date(params.data)
    nextDay.setDate(nextDay.getDate() + 1)
    query = query
      .gte('data_hora', `${params.data}T00:00:00`)
      .lt('data_hora', nextDay.toISOString().split('T')[0] + 'T00:00:00')
  }

  const [agendamentosRes, servicosRes, countsRes] = await Promise.all([
    query,
    supabase.from('servicos').select('*').eq('ativo', true).order('nome'),
    supabase.from('agendamentos').select('status'),
  ])

  const agendamentos = (agendamentosRes.data ?? []) as AgendamentoComRelacoes[]
  const total = agendamentosRes.count ?? 0
  const servicos = (servicosRes.data ?? []) as Servico[]

  const all = countsRes.data ?? []
  const statusCounts = {
    pendente:   all.filter(a => a.status === 'pendente').length,
    confirmado: all.filter(a => a.status === 'confirmado').length,
    concluido:  all.filter(a => a.status === 'concluido').length,
    cancelado:  all.filter(a => a.status === 'cancelado').length,
    faltou:     all.filter(a => a.status === 'faltou').length,
  }

  return (
    <AgendamentosPageClient
      agendamentos={agendamentos}
      servicos={servicos}
      total={total}
      pagina={pagina}
      pageSize={pageSize}
      statusCounts={statusCounts}
    />
  )
}
