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
    },
    {
      label: 'Confirmados',
      value: confirmados.toString(),
      sub: 'agendamentos pelo bot',
      icon: CalendarCheck,
    },
    {
      label: 'Em Andamento',
      value: andamento.toString(),
      sub: 'conversas em negociação',
      icon: Clock,
    },
    {
      label: 'Taxa de Conversão',
      value: taxa !== null ? `${taxa}%` : '—',
      sub: 'conversas → agendamento',
      icon: TrendingUp,
    },
  ]

  return (
    <div className="space-y-2">
      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
        WhatsApp — Bot João
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
