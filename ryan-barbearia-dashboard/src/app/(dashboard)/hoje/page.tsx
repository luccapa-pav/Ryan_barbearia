import { createClient } from '@/lib/supabase/server'
import { StatCards } from '@/components/hoje/stat-cards'
import { TimelineHoje } from '@/components/hoje/timeline'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

export const dynamic = 'force-dynamic'

export default async function HojePage() {
  const supabase = await createClient()
  const hoje = new Date()
  const hojeStr = format(hoje, 'yyyy-MM-dd')
  const amanha = format(new Date(hoje.setDate(hoje.getDate() + 1)), 'yyyy-MM-dd')

  const { data } = await supabase
    .from('agendamentos')
    .select('*, clientes (id, nome, telefone), servicos (id, nome, duracao_minutos, preco)')
    .gte('data_hora', `${hojeStr}T00:00:00`)
    .lt('data_hora', `${amanha}T00:00:00`)
    .not('status', 'eq', 'cancelado')
    .order('data_hora', { ascending: true })

  const agendamentos = (data ?? []) as AgendamentoComRelacoes[]
  const receitaPrevista = agendamentos.reduce((s, a) => s + (a.servicos?.preco ?? 0), 0)
  const concluidos = agendamentos.filter(a => a.status === 'concluido').length

  const dataLabel = format(new Date(), "EEEE',' dd 'de' MMMM", { locale: ptBR })
  const dataCapitalizada = dataLabel.charAt(0).toUpperCase() + dataLabel.slice(1)

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">
          {dataCapitalizada}
        </p>
        <h2 className="text-2xl font-display font-bold text-foreground">Visão do dia</h2>
      </div>

      <StatCards
        totalAgendamentos={agendamentos.length}
        receitaPrevista={receitaPrevista}
        concluidos={concluidos}
      />

      <TimelineHoje agendamentosIniciais={agendamentos} hojeStr={hojeStr} />
    </div>
  )
}
