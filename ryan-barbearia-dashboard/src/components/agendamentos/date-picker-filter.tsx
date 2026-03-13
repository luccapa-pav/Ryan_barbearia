'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isToday, addMonths, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DatePickerFilterProps {
  value: string       // 'YYYY-MM-DD' ou ''
  onChange: (v: string) => void
  disabled?: boolean
}

const DOW = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S']

export function DatePickerFilter({ value, onChange, disabled }: DatePickerFilterProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<Date>(() =>
    value ? new Date(value + 'T12:00:00') : new Date()
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const selected = value ? new Date(value + 'T12:00:00') : null
  const days = eachDayOfInterval({ start: startOfMonth(view), end: endOfMonth(view) })
  const blanks = Array.from({ length: getDay(startOfMonth(view)) })

  function pick(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold font-gotham uppercase tracking-wide transition-all duration-150 hover:scale-105 active:scale-95',
          selected
            ? 'bg-primary text-primary-foreground shadow-sm'
            : 'bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/80'
        )}
      >
        <CalendarDays className="w-3.5 h-3.5 shrink-0" />
        {selected ? format(selected, "dd/MM/yyyy") : 'Data'}
        {selected && (
          <span onClick={clear}>
            <X className="w-3 h-3 opacity-70 hover:opacity-100" />
          </span>
        )}
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-elevated p-4 w-[268px]">
          {/* Cabeçalho do mês */}
          <div className="flex items-center justify-between mb-3">
            <button
              type="button"
              onClick={() => setView(d => subMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <p className="text-sm font-bold text-foreground capitalize font-gotham">
              {format(view, 'MMMM yyyy', { locale: ptBR })}
            </p>
            <button
              type="button"
              onClick={() => setView(d => addMonths(d, 1))}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Dias da semana */}
          <div className="grid grid-cols-7 mb-1">
            {DOW.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                {d}
              </div>
            ))}
          </div>

          {/* Grade de dias */}
          <div className="grid grid-cols-7 gap-0.5">
            {blanks.map((_, i) => <div key={`b${i}`} />)}
            {days.map(day => {
              const isSel = selected ? isSameDay(day, selected) : false
              const isTod = isToday(day)
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => pick(day)}
                  className={cn(
                    'w-full aspect-square rounded-lg text-xs font-semibold transition-all hover:scale-110 active:scale-95 leading-none flex items-center justify-center',
                    isSel && 'bg-primary text-primary-foreground shadow-brand',
                    !isSel && isTod && 'border border-primary text-primary font-bold',
                    !isSel && !isTod && 'text-foreground hover:bg-muted'
                  )}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {/* Rodapé */}
          <div className="flex justify-between mt-3 pt-3 border-t border-border">
            <button
              type="button"
              onClick={clear}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
            >
              Limpar
            </button>
            <button
              type="button"
              onClick={() => pick(new Date())}
              className="text-xs text-primary font-bold hover:text-primary/80 transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
