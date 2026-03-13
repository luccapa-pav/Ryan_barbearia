import { Clock, User, Scissors } from 'lucide-react'
import { formatarHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface AgendamentoCardProps {
  agendamento: AgendamentoComRelacoes
}

export function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  const hora = formatarHora(agendamento.data_hora)
  const statusLabel = STATUS_LABELS[agendamento.status]
  const statusColor = STATUS_COLORS[agendamento.status]

  return (
    <div className="px-5 py-4 flex items-start gap-4 hover:bg-secondary/30 transition-colors">
      {/* Time */}
      <div className="flex-shrink-0 w-14 text-center">
        <p className="text-lg font-bold text-amber-500 leading-none">{hora}</p>
        <p className="text-xs text-muted-foreground mt-1">
          {agendamento.servicos?.duracao_minutos}min
        </p>
      </div>

      {/* Divider */}
      <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-1">
        <div className="w-2 h-2 rounded-full bg-amber-500" />
        <div className="w-px flex-1 bg-border min-h-[24px]" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <p className="font-medium text-foreground text-sm truncate">
                {agendamento.clientes?.nome}
              </p>
            </div>
            <div className="flex items-center gap-1.5 mt-1">
              <Scissors className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
              <p className="text-sm text-muted-foreground truncate">
                {agendamento.servicos?.nome}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
              statusColor
            )}>
              {statusLabel}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatarMoeda(agendamento.servicos?.preco ?? 0)}
            </span>
          </div>
        </div>

        {agendamento.observacoes && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {agendamento.observacoes}
          </p>
        )}
      </div>
    </div>
  )
}
