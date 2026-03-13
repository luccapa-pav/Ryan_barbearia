'use client'

import { useRouter } from 'next/navigation'
import { CalendarCheck, DollarSign, CheckCircle, TrendingUp } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'

interface MetricasAgendamentosProps {
  total: number
  receita: number
  concluidos: number
}

const TOOLTIPS = {
  'Agendamentos': 'Total de agendamentos no período, excluindo cancelados',
  'Receita Prevista': 'Soma dos valores dos serviços agendados no período',
  'Concluídos': 'Agendamentos com status "Concluído"',
  'Aproveitamento': 'Concluídos ÷ Total × 100%',
}

export function MetricasAgendamentos({ total, receita, concluidos }: MetricasAgendamentosProps) {
  const router = useRouter()
  const aproveitamento = total > 0 ? Math.round((concluidos / total) * 100) : null

  const cards = [
    { label: 'Agendamentos',   value: total.toString(),                                 sub: 'no período',                                 icon: CalendarCheck, primary: true,  href: '/agendamentos' },
    { label: 'Receita Prevista', value: formatarMoeda(receita),                         sub: 'em serviços',                                icon: DollarSign,    primary: false, href: '/agendamentos' },
    { label: 'Concluídos',     value: concluidos.toString(),                            sub: `de ${total} agendamento${total !== 1 ? 's' : ''}`, icon: CheckCircle, primary: false, href: '/agendamentos' },
    { label: 'Aproveitamento', value: aproveitamento !== null ? `${aproveitamento}%` : '—', sub: 'taxa de conclusão',                      icon: TrendingUp,    primary: false, href: null },
  ]

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-gotham font-bold text-primary uppercase tracking-widest">
        Agendamentos
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {cards.map((card) => {
          const Icon = card.icon
          const tooltip = TOOLTIPS[card.label as keyof typeof TOOLTIPS]
          const clickable = !!card.href
          return (
            <div
              key={card.label}
              onClick={() => card.href && router.push(card.href)}
              title={tooltip}
              className={`group relative bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 hover:border-primary shadow-card hover:shadow-elevated transition-all duration-200 ease-out hover:scale-[1.04] hover:-translate-y-1 p-5 flex flex-col items-center text-center gap-4 overflow-hidden ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

              <div className="flex flex-col items-center gap-2 w-full">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${card.primary ? 'bg-primary/15 group-hover:bg-primary/30' : 'bg-muted group-hover:bg-primary/15'}`}>
                  <Icon className={`w-4 h-4 transition-colors duration-200 ${card.primary ? 'text-primary' : 'text-muted-foreground group-hover:text-primary'}`} />
                </div>
                <p className="text-[11px] font-extrabold text-foreground/80 uppercase tracking-widest font-gotham">
                  {card.label}
                </p>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <p className="text-2xl font-gotham font-black text-foreground tabular-nums leading-none tracking-tight">
                  {card.value}
                </p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>

              {clickable && (
                <span className="text-[10px] text-primary/0 group-hover:text-primary/60 transition-colors font-medium">
                  Ver detalhes →
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
