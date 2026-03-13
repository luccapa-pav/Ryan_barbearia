'use client'

import { useState, useMemo } from 'react'
import {
  format, addWeeks, subWeeks, addMonths, subMonths,
  startOfWeek, endOfWeek, startOfMonth, endOfMonth,
  eachDayOfInterval, isSameDay, isToday, isSameMonth,
  addDays, subDays, getDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'
import { DatePickerFilter } from '@/components/agendamentos/date-picker-filter'
import { formatarHora, STATUS_COLORS, cn } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

type CalView = 'hoje' | 'semana' | 'mes' | 'ano' | 'custom'

const VIEW_LABELS: Record<CalView, string> = {
  hoje: 'Hoje',
  semana: 'Semana',
  mes: 'Mês',
  ano: 'Ano',
  custom: 'Data',
}

const MONTH_NAMES = [
  'Jan','Fev','Mar','Abr','Mai','Jun',
  'Jul','Ago','Set','Out','Nov','Dez',
]
const DOW_SHORT = ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']

interface CalendarioClientProps {
  agendamentos: AgendamentoComRelacoes[]
}

export function CalendarioClient({ agendamentos }: CalendarioClientProps) {
  const [view, setView]           = useState<CalView>('semana')
  const [current, setCurrent]     = useState<Date>(new Date())
  const [customDate, setCustomDate] = useState<string>('')

  // Índice por data YYYY-MM-DD — O(1) lookup
  const byDate = useMemo(() => {
    const map: Record<string, AgendamentoComRelacoes[]> = {}
    for (const a of agendamentos) {
      const key = a.data_hora.slice(0, 10)
      if (!map[key]) map[key] = []
      map[key].push(a)
    }
    return map
  }, [agendamentos])

  function getForDate(date: Date) {
    return byDate[format(date, 'yyyy-MM-dd')] ?? []
  }

  // ── Navegação ──
  function prev() {
    if (view === 'hoje') setCurrent(d => subDays(d, 1))
    else if (view === 'semana') setCurrent(d => subWeeks(d, 1))
    else if (view === 'mes')   setCurrent(d => subMonths(d, 1))
    else if (view === 'ano')   setCurrent(d => new Date(d.getFullYear() - 1, 0, 1))
  }
  function next() {
    if (view === 'hoje') setCurrent(d => addDays(d, 1))
    else if (view === 'semana') setCurrent(d => addWeeks(d, 1))
    else if (view === 'mes')   setCurrent(d => addMonths(d, 1))
    else if (view === 'ano')   setCurrent(d => new Date(d.getFullYear() + 1, 0, 1))
  }
  function goToday() { setCurrent(new Date()) }

  function goToDay(day: Date) { setCurrent(day); setView('hoje') }
  function goToMonth(monthIndex: number) {
    setCurrent(new Date(current.getFullYear(), monthIndex, 1))
    setView('mes')
  }

  // ── Label do header ──
  const titleLabel = useMemo(() => {
    if (view === 'hoje') return format(current, "EEEE',' dd 'de' MMMM yyyy", { locale: ptBR })
    if (view === 'semana') {
      const wStart = startOfWeek(current, { weekStartsOn: 1 })
      const wEnd   = endOfWeek(current, { weekStartsOn: 1 })
      return `${format(wStart, "dd 'de' MMM", { locale: ptBR })} – ${format(wEnd, "dd 'de' MMM yyyy", { locale: ptBR })}`
    }
    if (view === 'mes') return format(current, "MMMM 'de' yyyy", { locale: ptBR })
    if (view === 'ano') return String(current.getFullYear())
    if (view === 'custom' && customDate) {
      const d = new Date(customDate + 'T12:00:00')
      return format(d, "EEEE',' dd 'de' MMMM yyyy", { locale: ptBR })
    }
    return 'Escolha uma data'
  }, [view, current, customDate])

  const showNav = view !== 'custom'

  return (
    <div className="space-y-5 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col items-center text-center gap-3">
        <div>
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Calendário</h2>
          <p className="text-base font-semibold text-muted-foreground capitalize tracking-wide mt-1">
            {titleLabel}
          </p>
        </div>

        {/* Controles */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {/* View tabs */}
          <div className="flex gap-1 rounded-xl bg-muted/60 p-1 border border-border/60">
            {(Object.keys(VIEW_LABELS) as CalView[]).map(v => (
              <button
                key={v}
                onClick={() => setView(v)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase',
                  view === v
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
                )}
              >
                {VIEW_LABELS[v]}
              </button>
            ))}
          </div>

          {/* Custom date picker */}
          {view === 'custom' && (
            <DatePickerFilter value={customDate} onChange={setCustomDate} />
          )}

          {/* Navegação prev/next + hoje */}
          {showNav && (
            <div className="flex items-center gap-1">
              <button
                onClick={prev}
                className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToday}
                className="px-3 py-1.5 rounded-lg text-xs font-bold font-gotham uppercase text-muted-foreground hover:text-foreground border border-border/60 hover:bg-card/80 transition-all hover:scale-105 active:scale-95"
              >
                Hoje
              </button>
              <button
                onClick={next}
                className="p-1.5 rounded-lg border border-border/60 text-muted-foreground hover:text-foreground hover:bg-card/80 transition-all hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Conteúdo da view */}
      {view === 'hoje' && (
        <DayView date={current} appts={getForDate(current)} />
      )}
      {view === 'semana' && (
        <WeekView current={current} byDate={byDate} onDayClick={goToDay} />
      )}
      {view === 'mes' && (
        <MonthView current={current} byDate={byDate} onDayClick={goToDay} />
      )}
      {view === 'ano' && (
        <YearView year={current.getFullYear()} byDate={byDate} onMonthClick={goToMonth} />
      )}
      {view === 'custom' && (
        customDate
          ? <DayView date={new Date(customDate + 'T12:00:00')} appts={getForDate(new Date(customDate + 'T12:00:00'))} />
          : (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <CalendarDays className="w-10 h-10 opacity-30" />
              <p className="text-sm font-semibold">Escolha uma data acima</p>
            </div>
          )
      )}
    </div>
  )
}

// ── DayView ──────────────────────────────────────────────────────────────────

function DayView({ date, appts }: { date: Date; appts: AgendamentoComRelacoes[] }) {
  const sorted = [...appts].sort((a, b) => a.data_hora.localeCompare(b.data_hora))
  const isHoje = isToday(date)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className={cn(
        'px-5 py-3 border-b border-border flex items-center gap-3',
        isHoje && 'bg-primary/5'
      )}>
        <div className={cn(
          'flex items-center justify-center w-10 h-10 rounded-xl font-gotham font-black text-xl',
          isHoje ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}>
          {format(date, 'd')}
        </div>
        <div>
          <p className="font-gotham font-bold text-foreground capitalize">
            {format(date, "EEEE", { locale: ptBR })}
          </p>
          <p className="text-xs text-muted-foreground">
            {sorted.length} agendamento{sorted.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {sorted.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-2">
          <CalendarDays className="w-8 h-8 opacity-30" />
          <p className="text-sm">Nenhum agendamento neste dia</p>
        </div>
      ) : (
        <div className="divide-y divide-border">
          {sorted.map(a => (
            <div key={a.id} className="px-5 py-3.5 flex items-center gap-4">
              <span className="text-sm font-bold font-gotham text-foreground tabular-nums w-12 shrink-0">
                {formatarHora(a.data_hora)}
              </span>
              <div className={cn('w-1.5 h-1.5 rounded-full shrink-0', statusDot(a.status))} />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-foreground truncate">{a.clientes?.nome}</p>
                <p className="text-xs text-muted-foreground truncate">{a.servicos?.nome}</p>
              </div>
              <span className={cn(
                'ml-auto shrink-0 text-[10px] font-bold font-gotham uppercase px-2 py-0.5 rounded-lg border',
                STATUS_COLORS[a.status]
              )}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── WeekView ─────────────────────────────────────────────────────────────────

function WeekView({
  current, byDate, onDayClick,
}: {
  current: Date
  byDate: Record<string, AgendamentoComRelacoes[]>
  onDayClick: (d: Date) => void
}) {
  const wStart = startOfWeek(current, { weekStartsOn: 1 })
  const days   = eachDayOfInterval({ start: wStart, end: addDays(wStart, 6) })

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Header dias */}
      <div className="grid grid-cols-7 border-b border-border">
        {days.map((day, i) => {
          const appts  = byDate[format(day, 'yyyy-MM-dd')] ?? []
          const isTod  = isToday(day)
          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'flex flex-col items-center gap-1 py-3 border-r border-border last:border-r-0 transition-colors hover:bg-muted/40 cursor-pointer',
                isTod && 'bg-primary/5'
              )}
            >
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                {DOW_SHORT[i]}
              </span>
              <span className={cn(
                'flex items-center justify-center w-8 h-8 rounded-full text-sm font-gotham font-black',
                isTod ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </span>
              {appts.length > 0 && (
                <span className="text-[10px] font-bold text-primary">
                  {appts.length}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Agendamentos por coluna */}
      <div className="grid grid-cols-7 min-h-[300px]">
        {days.map(day => {
          const appts = byDate[format(day, 'yyyy-MM-dd')] ?? []
          const sorted = [...appts].sort((a, b) => a.data_hora.localeCompare(b.data_hora))
          const isTod = isToday(day)
          return (
            <div
              key={day.toISOString()}
              className={cn(
                'border-r border-border last:border-r-0 p-1.5 space-y-1',
                isTod && 'bg-primary/5'
              )}
            >
              {sorted.map(a => (
                <div
                  key={a.id}
                  className={cn(
                    'px-2 py-1.5 rounded-lg text-xs border truncate cursor-default',
                    STATUS_COLORS[a.status]
                  )}
                  title={`${formatarHora(a.data_hora)} — ${a.clientes?.nome} — ${a.servicos?.nome}`}
                >
                  <span className="font-bold">{formatarHora(a.data_hora)}</span>
                  {' '}
                  <span className="hidden sm:inline">{a.clientes?.nome?.split(' ')[0]}</span>
                </div>
              ))}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── MonthView ─────────────────────────────────────────────────────────────────

function MonthView({
  current, byDate, onDayClick,
}: {
  current: Date
  byDate: Record<string, AgendamentoComRelacoes[]>
  onDayClick: (d: Date) => void
}) {
  const mStart   = startOfMonth(current)
  const mEnd     = endOfMonth(current)
  // Preenche grade para começar na segunda-feira
  const gridStart = startOfWeek(mStart, { weekStartsOn: 1 })
  const gridEnd   = endOfWeek(mEnd, { weekStartsOn: 1 })
  const days      = eachDayOfInterval({ start: gridStart, end: gridEnd })

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      {/* Cabeçalho semana */}
      <div className="grid grid-cols-7 border-b border-border">
        {DOW_SHORT.map(d => (
          <div key={d} className="py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-r border-border last:border-r-0">
            {d}
          </div>
        ))}
      </div>

      {/* Grade de dias */}
      <div className="grid grid-cols-7">
        {days.map(day => {
          const appts        = byDate[format(day, 'yyyy-MM-dd')] ?? []
          const isTod        = isToday(day)
          const isCurrentMon = isSameMonth(day, current)
          const sorted       = [...appts].sort((a, b) => a.data_hora.localeCompare(b.data_hora))

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={cn(
                'border-r border-b border-border last:border-r-0 min-h-[90px] p-2 flex flex-col gap-1 text-left hover:bg-muted/30 transition-colors cursor-pointer',
                !isCurrentMon && 'opacity-30'
              )}
            >
              <span className={cn(
                'flex items-center justify-center w-6 h-6 rounded-full text-xs font-gotham font-black',
                isTod ? 'bg-primary text-primary-foreground' : 'text-foreground'
              )}>
                {format(day, 'd')}
              </span>
              <div className="flex flex-col gap-0.5 w-full">
                {sorted.slice(0, 2).map(a => (
                  <div
                    key={a.id}
                    className={cn(
                      'px-1.5 py-0.5 rounded text-[10px] font-semibold truncate border',
                      STATUS_COLORS[a.status]
                    )}
                  >
                    {formatarHora(a.data_hora)} {a.clientes?.nome?.split(' ')[0]}
                  </div>
                ))}
                {sorted.length > 2 && (
                  <p className="text-[10px] text-primary font-bold">+{sorted.length - 2} mais</p>
                )}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── YearView ─────────────────────────────────────────────────────────────────

function YearView({
  year, byDate, onMonthClick,
}: {
  year: number
  byDate: Record<string, AgendamentoComRelacoes[]>
  onMonthClick: (monthIndex: number) => void
}) {
  // Contagem de agendamentos por mês
  const countByMonth = useMemo(() => {
    const counts: number[] = Array(12).fill(0)
    for (const key of Object.keys(byDate)) {
      if (key.startsWith(String(year))) {
        const month = parseInt(key.slice(5, 7), 10) - 1
        counts[month] += byDate[key].length
      }
    }
    return counts
  }, [byDate, year])

  const today = new Date()

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
      {MONTH_NAMES.map((name, i) => {
        const count    = countByMonth[i]
        const isCurrentMonth = today.getFullYear() === year && today.getMonth() === i
        const mStart   = new Date(year, i, 1)
        const mEnd     = endOfMonth(mStart)
        const gridStart = startOfWeek(mStart, { weekStartsOn: 1 })
        const days     = eachDayOfInterval({ start: gridStart, end: mEnd })

        return (
          <button
            key={i}
            onClick={() => onMonthClick(i)}
            className={cn(
              'bg-card border rounded-2xl p-3 text-left hover:border-primary/50 hover:shadow-elevated transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]',
              isCurrentMonth ? 'border-primary/40 shadow-sm' : 'border-border'
            )}
          >
            <div className="flex items-center justify-between mb-2">
              <p className={cn(
                'text-sm font-gotham font-black',
                isCurrentMonth ? 'text-primary' : 'text-foreground'
              )}>
                {name}
              </p>
              {count > 0 && (
                <span className="text-[10px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-lg">
                  {count}
                </span>
              )}
            </div>

            {/* Mini grade do mês */}
            <MiniMonth year={year} month={i} byDate={byDate} />
          </button>
        )
      })}
    </div>
  )
}

function MiniMonth({
  year, month, byDate,
}: {
  year: number
  month: number
  byDate: Record<string, AgendamentoComRelacoes[]>
}) {
  const mStart    = new Date(year, month, 1)
  const mEnd      = endOfMonth(mStart)
  const gridStart = startOfWeek(mStart, { weekStartsOn: 1 })
  const days      = eachDayOfInterval({ start: gridStart, end: mEnd })
  const today     = new Date()

  // Dias em branco no início
  const blanks = (getDay(mStart) + 6) % 7 // converte domingo=0 → segunda=0

  return (
    <div>
      <div className="grid grid-cols-7 mb-0.5">
        {['S','T','Q','Q','S','S','D'].map((d, i) => (
          <div key={i} className="text-center text-[8px] text-muted-foreground/60 font-bold">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {Array.from({ length: blanks }).map((_, i) => <div key={`b${i}`} />)}
        {days.map(day => {
          if (!isSameMonth(day, mStart)) return null
          const key    = format(day, 'yyyy-MM-dd')
          const hasApt = (byDate[key]?.length ?? 0) > 0
          const isTod  = isSameDay(day, today)
          return (
            <div key={day.toISOString()} className="flex items-center justify-center">
              <div className={cn(
                'w-4 h-4 rounded-sm flex items-center justify-center text-[8px] font-bold',
                isTod && 'bg-primary text-primary-foreground rounded-full',
                !isTod && hasApt && 'bg-primary/20 text-primary',
                !isTod && !hasApt && 'text-muted-foreground/50'
              )}>
                {format(day, 'd')}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── helpers ───────────────────────────────────────────────────────────────────

function statusDot(status: string) {
  const map: Record<string, string> = {
    pendente:   'bg-amber-500',
    confirmado: 'bg-blue-500',
    concluido:  'bg-emerald-500',
    cancelado:  'bg-red-500',
    faltou:     'bg-zinc-500',
  }
  return map[status] ?? 'bg-zinc-400'
}
