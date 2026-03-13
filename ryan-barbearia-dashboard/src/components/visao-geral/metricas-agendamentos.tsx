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
      highlight: true,
    },
    {
      label: 'Receita Prevista',
      value: formatarMoeda(receita),
      sub: 'em serviços',
      icon: DollarSign,
      highlight: false,
    },
    {
      label: 'Concluídos',
      value: concluidos.toString(),
      sub: `de ${total} agendamento${total !== 1 ? 's' : ''}`,
      icon: CheckCircle,
      highlight: false,
    },
    {
      label: 'Aproveitamento',
      value: aproveitamento !== null ? `${aproveitamento}%` : '—',
      sub: 'taxa de conclusão',
      icon: TrendingUp,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-0.5 h-3.5 rounded-full bg-primary inline-block" />
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          Agendamentos
        </p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative bg-card rounded-xl border border-border hover:border-primary/25 shadow-card hover:shadow-elevated transition-all duration-200 ease-out hover:-translate-y-0.5 p-5 flex flex-col gap-4 overflow-hidden"
            >
              {/* Subtle top glow on hover */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-muted-foreground">{card.label}</p>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${
                  card.highlight
                    ? 'bg-primary/15 group-hover:bg-primary/25'
                    : 'bg-muted group-hover:bg-primary/10'
                }`}>
                  <Icon className={`w-3.5 h-3.5 transition-colors duration-200 ${
                    card.highlight ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  }`} />
                </div>
              </div>
              <div>
                <p className="text-2xl font-display font-bold text-foreground tabular-nums">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{card.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
