import { formatarHora, formatarMoeda, STATUS_LABELS, STATUS_COLORS, cn } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface AgendamentoCardProps {
  agendamento: AgendamentoComRelacoes
}

const FLASH_STATUS = new Set(['confirmado', 'concluido'])

function tempoRelativo(dataHora: string): string {
  const diff = Math.round((new Date(dataHora).getTime() - Date.now()) / 60000)
  if (diff > 0) {
    if (diff < 60) return `em ${diff}min`
    const h = Math.round(diff / 60)
    return `em ${h}h`
  }
  const abs = Math.abs(diff)
  if (abs < 60) return abs <= 2 ? 'agora' : `há ${abs}min`
  const h = Math.round(abs / 60)
  return `há ${h}h`
}

export function AgendamentoCard({ agendamento }: AgendamentoCardProps) {
  const hora = formatarHora(agendamento.data_hora)
  const relativo = tempoRelativo(agendamento.data_hora)
  const hasFlash = FLASH_STATUS.has(agendamento.status)

  return (
    <div className={cn(
      'flex items-center gap-4 px-5 py-4 hover:bg-muted/40 transition-colors group relative overflow-hidden',
      hasFlash && 'animate-status-flash'
    )}>
      {/* Hora */}
      <div className="w-16 shrink-0 text-center">
        <p className="text-base font-display font-bold text-primary leading-none">{hora}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5 tabular-nums">{relativo}</p>
      </div>

      {/* Linha vertical */}
      <div className="shrink-0 flex flex-col items-center gap-1 self-stretch py-1">
        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
        <div className="w-px flex-1 bg-border min-h-[20px]" />
      </div>

      {/* Dados */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-foreground text-sm leading-tight">{agendamento.clientes?.nome}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {agendamento.servicos?.nome}
              <span className="text-muted-foreground/50 ml-1">· {agendamento.servicos?.duracao_minutos}min</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            <span className={cn(
              'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border',
              STATUS_COLORS[agendamento.status]
            )}>
              {STATUS_LABELS[agendamento.status]}
            </span>
            <span className="text-sm font-semibold text-foreground">
              {formatarMoeda(agendamento.servicos?.preco ?? 0)}
            </span>
          </div>
        </div>
        {agendamento.observacoes && (
          <p className="text-[11px] text-muted-foreground mt-1.5 truncate italic">{agendamento.observacoes}</p>
        )}
      </div>
    </div>
  )
}
