'use client'

import { useRouter, usePathname } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
  startOfWeek,
  eachDayOfInterval,
  isSameDay,
  parseISO,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { formatarHora, STATUS_COLORS, STATUS_LABELS, cn } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

interface CalendarioPageClientProps {
  agendamentos: AgendamentoComRelacoes[]
  view: 'semana' | 'mes'
  dataInicioStr: string
  dataFimStr: string
}

export function CalendarioPageClient({
  agendamentos,
  view,
  dataInicioStr,
  dataFimStr,
}: CalendarioPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()

  const dataInicio = parseISO(dataInicioStr)
  const dataFim = parseISO(dataFimStr)

  function navigate(direction: 'prev' | 'next') {
    const hoje = new Date()
    let newDate: Date

    if (view === 'semana') {
      newDate = direction === 'next' ? addWeeks(dataInicio, 1) : subWeeks(dataInicio, 1)
      router.push(`${pathname}?view=semana&semana=${format(newDate, 'yyyy-MM-dd')}`)
    } else {
      const mesAtual = new Date(dataInicio.getFullYear(), dataInicio.getMonth(), 1)
      newDate = direction === 'next' ? addMonths(mesAtual, 1) : subMonths(mesAtual, 1)
      router.push(`${pathname}?view=mes&mes=${format(newDate, 'yyyy-MM')}`)
    }
  }

  function switchView(v: 'semana' | 'mes') {
    const hoje = new Date()
    if (v === 'semana') {
      router.push(`${pathname}?view=semana&semana=${format(hoje, 'yyyy-MM-dd')}`)
    } else {
      router.push(`${pathname}?view=mes&mes=${format(hoje, 'yyyy-MM')}`)
    }
  }

  const days = eachDayOfInterval({ start: dataInicio, end: dataFim })

  const titleLabel = view === 'mes'
    ? format(dataInicio, "MMMM 'de' yyyy", { locale: ptBR })
    : `${format(dataInicio, "dd 'de' MMM", { locale: ptBR })} – ${format(dataFim, "dd 'de' MMM 'de' yyyy", { locale: ptBR })}`

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground capitalize">{titleLabel}</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {agendamentos.length} agendamento{agendamentos.length !== 1 ? 's' : ''} no período
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex gap-1 bg-card border border-border rounded-lg p-1">
            {(['semana', 'mes'] as const).map(v => (
              <button
                key={v}
                onClick={() => switchView(v)}
                className={cn(
                  'px-3 py-1.5 text-sm rounded-md transition-colors capitalize',
                  view === v
                    ? 'bg-amber-500 text-zinc-950 font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {v === 'semana' ? 'Semana' : 'Mês'}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex gap-1">
            <button
              onClick={() => navigate('prev')}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate('next')}
              className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Day headers */}
        <div className={`grid border-b border-border ${view === 'mes' ? 'grid-cols-7' : 'grid-cols-7'}`}>
          {(view === 'semana' ? days : eachDayOfInterval({
            start: startOfWeek(dataInicio, { weekStartsOn: 0 }),
            end: startOfWeek(dataInicio, { weekStartsOn: 0 })
          })).map((_, i) => {
            const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
            return (
              <div key={i} className="px-3 py-2.5 text-xs font-medium text-muted-foreground text-center uppercase tracking-wider border-r border-border last:border-r-0">
                {dayNames[i]}
              </div>
            )
          })}
        </div>

        {/* Days */}
        {view === 'semana' ? (
          <div className="grid grid-cols-7 min-h-[400px]">
            {days.map((day) => {
              const dayAppts = agendamentos.filter(a => isSameDay(parseISO(a.data_hora), day))
              const isToday = isSameDay(day, new Date())

              return (
                <div key={day.toISOString()} className="border-r border-border last:border-r-0 min-h-[200px]">
                  <div className={cn(
                    'px-3 py-2 border-b border-border/50',
                    isToday ? 'bg-amber-500/5' : ''
                  )}>
                    <span className={cn(
                      'inline-flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold',
                      isToday ? 'bg-amber-500 text-zinc-950' : 'text-foreground'
                    )}>
                      {format(day, 'd')}
                    </span>
                  </div>
                  <div className="p-1.5 space-y-1">
                    {dayAppts.map(a => (
                      <div
                        key={a.id}
                        className={cn(
                          'px-2 py-1.5 rounded text-xs border truncate',
                          STATUS_COLORS[a.status]
                        )}
                        title={`${formatarHora(a.data_hora)} — ${a.clientes?.nome} — ${a.servicos?.nome}`}
                      >
                        <span className="font-semibold">{formatarHora(a.data_hora)}</span>
                        {' '}
                        {a.clientes?.nome}
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          // Month view — simplified
          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayAppts = agendamentos.filter(a => isSameDay(parseISO(a.data_hora), day))
              const isToday = isSameDay(day, new Date())
              const isCurrentMonth = day.getMonth() === dataInicio.getMonth()

              return (
                <div key={day.toISOString()} className={cn(
                  'border-r border-b border-border last:border-r-0 min-h-[80px] p-2',
                  !isCurrentMonth && 'opacity-40'
                )}>
                  <span className={cn(
                    'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1',
                    isToday ? 'bg-amber-500 text-zinc-950' : 'text-foreground'
                  )}>
                    {format(day, 'd')}
                  </span>
                  {dayAppts.length > 0 && (
                    <div className="space-y-0.5">
                      {dayAppts.slice(0, 2).map(a => (
                        <div
                          key={a.id}
                          className={cn(
                            'px-1.5 py-0.5 rounded text-xs truncate border',
                            STATUS_COLORS[a.status]
                          )}
                        >
                          {formatarHora(a.data_hora)} {a.clientes?.nome?.split(' ')[0]}
                        </div>
                      ))}
                      {dayAppts.length > 2 && (
                        <p className="text-xs text-muted-foreground">+{dayAppts.length - 2} mais</p>
                      )}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
