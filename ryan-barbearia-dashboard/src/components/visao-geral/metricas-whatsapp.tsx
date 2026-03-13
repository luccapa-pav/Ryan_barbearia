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
      sub: 'via WhatsApp',
      icon: MessageCircle,
      primary: true,
    },
    {
      label: 'Confirmados',
      value: confirmados.toString(),
      sub: 'agendamentos pelo bot',
      icon: CalendarCheck,
      primary: false,
    },
    {
      label: 'Em Andamento',
      value: andamento.toString(),
      sub: 'em negociação',
      icon: Clock,
      primary: false,
    },
    {
      label: 'Conversão',
      value: taxa !== null ? `${taxa}%` : '—',
      sub: 'conversa → agendamento',
      icon: TrendingUp,
      primary: false,
    },
  ]

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-gotham font-bold text-primary uppercase tracking-widest">
        Secretário João
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="group relative bg-card rounded-xl border-2 border-zinc-900 dark:border-zinc-700 hover:border-primary shadow-[0_4px_14px_rgba(0,0,0,0.18)] hover:shadow-elevated transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-4 overflow-hidden cursor-default"
            >
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
                <p className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest font-gotham">
                  {card.label}
                </p>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <p className="text-3xl font-gotham font-black text-foreground tabular-nums leading-none tracking-tight">
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
