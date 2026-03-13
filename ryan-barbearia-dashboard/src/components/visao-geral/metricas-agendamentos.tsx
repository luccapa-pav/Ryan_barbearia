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
      border: 'border-l-primary',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
    {
      label: 'Receita Prevista',
      value: formatarMoeda(receita),
      sub: 'em serviços',
      icon: DollarSign,
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
    {
      label: 'Concluídos',
      value: concluidos.toString(),
      sub: `de ${total} agendamentos`,
      icon: CheckCircle,
      border: 'border-l-blue-500',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-400',
    },
    {
      label: 'Aproveitamento',
      value: aproveitamento !== null ? `${aproveitamento}%` : '—',
      sub: 'taxa de conclusão',
      icon: TrendingUp,
      border: 'border-l-violet-500',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        Agendamentos
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, i) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className={`bg-card rounded-xl border border-border border-l-4 ${card.border} shadow-card p-5 flex flex-col gap-3`}
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {card.label}
                </p>
                <div className={`w-8 h-8 rounded-lg ${card.iconBg} flex items-center justify-center`}>
                  <Icon className={`w-4 h-4 ${card.iconColor}`} />
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
