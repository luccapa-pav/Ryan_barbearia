import { CalendarCheck, DollarSign, CheckCircle } from 'lucide-react'
import { formatarMoeda } from '@/lib/utils'

interface StatCardsProps {
  totalAgendamentos: number
  receitaPrevista: number
  concluidos: number
}

export function StatCards({ totalAgendamentos, receitaPrevista, concluidos }: StatCardsProps) {
  const stats = [
    {
      label: 'Agendamentos',
      value: totalAgendamentos.toString(),
      icon: CalendarCheck,
      description: 'agendamentos hoje',
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/20',
    },
    {
      label: 'Receita Prevista',
      value: formatarMoeda(receitaPrevista),
      icon: DollarSign,
      description: 'em serviços hoje',
      color: 'text-green-500',
      bg: 'bg-green-500/10',
      border: 'border-green-500/20',
    },
    {
      label: 'Concluídos',
      value: concluidos.toString(),
      icon: CheckCircle,
      description: `de ${totalAgendamentos} realizados`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="bg-card border border-border rounded-xl p-5 space-y-3"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground font-medium">{stat.label}</p>
              <div className={`w-8 h-8 rounded-lg ${stat.bg} border ${stat.border} flex items-center justify-center`}>
                <Icon className={`w-4 h-4 ${stat.color}`} />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
