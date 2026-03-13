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
      primary: true,
    },
    {
      label: 'Receita Prevista',
      value: formatarMoeda(receita),
      sub: 'em serviços',
      icon: DollarSign,
      primary: false,
    },
    {
      label: 'Concluídos',
      value: concluidos.toString(),
      sub: `de ${total} agendamento${total !== 1 ? 's' : ''}`,
      icon: CheckCircle,
      primary: false,
    },
    {
      label: 'Aproveitamento',
      value: aproveitamento !== null ? `${aproveitamento}%` : '—',
      sub: 'taxa de conclusão',
      icon: TrendingUp,
      primary: false,
    },
  ]

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-center gap-2">
        <span className="w-1 h-4 rounded-full bg-primary inline-block" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest font-gotham">
          Agendamentos
        </p>
        <span className="w-1 h-4 rounded-full bg-primary inline-block" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative bg-card rounded-xl border border-border hover:border-primary/40 shadow-card hover:shadow-elevated transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-4 overflow-hidden cursor-default"
            >
              {/* Top glow line on hover */}
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex flex-col items-center gap-2 w-full">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                  card.primary
                    ? 'bg-primary/15 group-hover:bg-primary/30'
                    : 'bg-muted group-hover:bg-primary/15'
                }`}>
                  <Icon className={`w-4 h-4 transition-colors duration-200 ${
                    card.primary ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'
                  }`} />
                </div>
                <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest font-gotham">
                  {card.label}
                </p>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <p className="text-4xl font-gotham font-black text-foreground tabular-nums leading-none tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
