'use client'

import { useState, useRef, useEffect } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { cn } from '@/lib/utils'

interface DatePickerFilterProps {
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}

const DOW_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function DatePickerFilter({ value, onChange, disabled }: DatePickerFilterProps) {
  const [open, setOpen] = useState(false)
  const [view, setView] = useState<Date>(() =>
    value ? new Date(value + 'T12:00:00') : new Date()
  )
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  const selected = value ? new Date(value + 'T12:00:00') : null
  const monthDays = eachDayOfInterval({ start: startOfMonth(view), end: endOfMonth(view) })
  const startBlankCount = getDay(startOfMonth(view)) // 0=Dom

  function pick(day: Date) {
    onChange(format(day, 'yyyy-MM-dd'))
    setOpen(false)
  }

  function clear(e: React.MouseEvent) {
    e.stopPropagation()
    onChange('')
  }

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center">
        <button
          type="button"
          disabled={disabled}
          onClick={() => setOpen(o => !o)}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 text-xs font-bold font-gotham uppercase tracking-wide transition-all duration-150 hover:scale-105 active:scale-95',
            selected
              ? 'bg-primary text-primary-foreground shadow-sm rounded-l-lg'
              : 'bg-muted/60 border border-border/50 text-muted-foreground hover:text-foreground hover:bg-card/80 rounded-lg'
          )}
        >
          <CalendarDays className="w-3.5 h-3.5 shrink-0" />
          {selected ? format(selected, "dd/MM/yyyy") : 'Data'}
        </button>
        {selected && (
          <button
            type="button"
            onClick={clear}
            tabIndex={-1}
            className="flex items-center justify-center pl-0.5 pr-2 py-1.5 bg-primary text-primary-foreground shadow-sm rounded-r-lg opacity-70 hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 mt-2 z-50 bg-card border border-border rounded-2xl shadow-elevated overflow-hidden w-72">
          {/* Cabeçalho do mês */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
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

          <div className="p-3">
            {/* Cabeçalho dias da semana */}
            <div className="grid grid-cols-7 mb-2">
              {DOW_LABELS.map(d => (
                <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                  {d.charAt(0)}
                </div>
              ))}
            </div>

            {/* Grade de dias */}
            <div className="grid grid-cols-7 gap-y-1">
              {/* Espaços em branco iniciais */}
              {Array.from({ length: startBlankCount }).map((_, i) => (
                <div key={`blank-${i}`} />
              ))}

              {monthDays.map(day => {
                const isSel = selected ? isSameDay(day, selected) : false
                const isTod = isToday(day)
                return (
                  <div key={day.toISOString()} className="flex items-center justify-center">
                    <button
                      type="button"
                      onClick={() => pick(day)}
                      className={cn(
                        'w-8 h-8 rounded-lg text-xs font-semibold transition-all hover:scale-110 active:scale-95 flex items-center justify-center',
                        isSel && 'bg-primary text-primary-foreground shadow-sm',
                        !isSel && isTod && 'border-2 border-primary text-primary font-black',
                        !isSel && !isTod && 'text-foreground hover:bg-muted'
                      )}
                    >
                      {format(day, 'd')}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Rodapé */}
          <div className="flex justify-between items-center px-4 py-2.5 border-t border-border bg-muted/30">
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
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors"
            >
              Hoje
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
