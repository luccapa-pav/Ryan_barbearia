import { CalendarCheck, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'

interface MetricasAgendamentosProps {
  total: number
  receita: number
  concluidos: number
}

export function MetricasAgendamentos({ total, receita, concluidos }: MetricasAgendamentosProps) {
  const aproveitamento = total > 0 ? Math.round((concluidos / total) * 100) : null

  const cards = [
    {
      label: 'Agendamentos',
      value: total.toString(),
      sub: 'no período',
      icon: CalendarCheck,
    },
    {
      label: 'Receita Prevista',
      value: formatarMoeda(receita),
      sub: 'em serviços',
      icon: DollarSign,
    },
    {
      label: 'Concluídos',
      value: concluidos.toString(),
      sub: `de ${total} agendamentos`,
      icon: CheckCircle,
    },
    {
      label: 'Aproveitamento',
      value: aproveitamento !== null ? `${aproveitamento}%` : '—',
      sub: 'taxa de conclusão',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        Agendamentos
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="bg-card rounded-xl border border-border shadow-card p-5 flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Icon className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
