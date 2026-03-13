import { MessageCircle, CalendarCheck, Clock, TrendingUp } from 'lucide-react'

interface LeadCRM {
  status: string | null
  timestamp_ultima_msg: string | null
  servicos: string | null
}

interface MetricasWhatsappProps {
  leads: LeadCRM[]
}

export function MetricasWhatsapp({ leads }: MetricasWhatsappProps) {
  const total       = leads.length
  const confirmados = leads.filter(l => l.status === '4').length
  const andamento   = leads.filter(l => l.status === '2' || l.status === '3').length
  const taxa        = total > 0 ? Math.round((confirmados / total) * 100) : null

  const cards = [
    {
      label: 'Conversas',
      value: total.toString(),
      sub: 'via WhatsApp no período',
      icon: MessageCircle,
      highlight: true,
    },
    {
      label: 'Confirmados',
      value: confirmados.toString(),
      sub: 'agendamentos pelo bot',
      icon: CalendarCheck,
      highlight: false,
    },
    {
      label: 'Em Andamento',
      value: andamento.toString(),
      sub: 'conversas em negociação',
      icon: Clock,
      highlight: false,
    },
    {
      label: 'Taxa de Conversão',
      value: taxa !== null ? `${taxa}%` : '—',
      sub: 'conversas → agendamento',
      icon: TrendingUp,
      highlight: false,
    },
  ]

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-2">
        <span className="w-0.5 h-3.5 rounded-full bg-primary inline-block" />
        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
          WhatsApp — Bot João
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
