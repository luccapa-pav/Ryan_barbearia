'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: 'Hoje',   value: 'hoje',   key: 'H' },
  { label: 'Semana', value: 'semana', key: 'S' },
  { label: 'Mês',    value: 'mes',    key: 'M' },
]

interface FiltroPeriodoProps {
  value: string
  onChange: (v: string) => void
}

export function FiltroPeriodo({ value, onChange }: FiltroPeriodoProps) {
  const [hasNewActivity, setHasNewActivity] = useState(false)

  // Indicador realtime — pisca quando chega novo agendamento
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('filtro-activity')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'agendamentos',
      }, () => {
        setHasNewActivity(true)
        setTimeout(() => setHasNewActivity(false), 8000)
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [])

  return (
    <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/60">
      {PRESETS.map(p => {
        const active = value === p.value
        const showDot = p.value === 'hoje' && hasNewActivity
        return (
          <button
            key={p.value}
            onClick={() => onChange(p.value)}
            title={`Atalho: ${p.key}`}
            className={cn(
              'relative px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
            )}
          >
            {p.label}
            {showDot && (
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
