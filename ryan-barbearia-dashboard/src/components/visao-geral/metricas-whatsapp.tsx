import { MessageCircle, CalendarCheck, Clock, TrendingUp } from 'lucide-react'

interface LeadCRM {
  status: string | null
  timestamp_ultima_msg: string | null
  servicos: string | null
}

interface MetricasWhatsappProps {
  leads: LeadCRM[]
}

// status: '1'=inicial, '2'=escolhendo serviço, '3'=negociando horário, '4'=confirmado
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
      border: 'border-l-sky-500',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-400',
    },
    {
      label: 'Confirmados',
      value: confirmados.toString(),
      sub: 'agendamentos pelo bot',
      icon: CalendarCheck,
      border: 'border-l-emerald-500',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-400',
    },
    {
      label: 'Em Andamento',
      value: andamento.toString(),
      sub: 'conversas em negociação',
      icon: Clock,
      border: 'border-l-orange-500',
      iconBg: 'bg-orange-500/10',
      iconColor: 'text-orange-400',
    },
    {
      label: 'Taxa de Conversão',
      value: taxa !== null ? `${taxa}%` : '—',
      sub: 'conversas → agendamento',
      icon: TrendingUp,
      border: 'border-l-violet-500',
      iconBg: 'bg-violet-500/10',
      iconColor: 'text-violet-400',
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
        WhatsApp — Bot João
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
