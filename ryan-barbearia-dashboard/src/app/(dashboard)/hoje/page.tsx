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
  const amanha = new Date(hoje)
  amanha.setDate(amanha.getDate() + 1)
  const amanhaStr = format(amanha, 'yyyy-MM-dd')

  const { data: agendamentos } = await supabase
    .from('agendamentos')
    .select(`
      *,
      clientes (id, nome, telefone),
      servicos (id, nome, duracao_minutos, preco)
    `)
    .gte('data_hora', `${hojeStr}T00:00:00`)
    .lt('data_hora', `${amanhaStr}T00:00:00`)
    .not('status', 'eq', 'cancelado')
    .order('data_hora', { ascending: true })

  const agendamentosHoje = (agendamentos ?? []) as AgendamentoComRelacoes[]

  // Calculate stats
  const totalAgendamentos = agendamentosHoje.length
  const receitaPrevista = agendamentosHoje
    .filter(a => a.status !== 'cancelado')
    .reduce((sum, a) => sum + (a.servicos?.preco ?? 0), 0)
  const concluidos = agendamentosHoje.filter(a => a.status === 'concluido').length

  const dataFormatada = format(hoje, "EEEE, dd 'de' MMMM", { locale: ptBR })
  const dataCapitalizada = dataFormatada.charAt(0).toUpperCase() + dataFormatada.slice(1)

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page header */}
      <div>
        <p className="text-muted-foreground text-sm capitalize">{dataCapitalizada}</p>
        <h2 className="text-2xl font-bold text-foreground mt-1">Visão do dia</h2>
      </div>

      {/* Stat cards */}
      <StatCards
        totalAgendamentos={totalAgendamentos}
        receitaPrevista={receitaPrevista}
        concluidos={concluidos}
      />

      {/* Timeline */}
      <TimelineHoje agendamentosIniciais={agendamentosHoje} hojeStr={hojeStr} />
    </div>
  )
}
