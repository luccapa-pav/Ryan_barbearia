'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: 'Hoje',   value: 'hoje',   key: 'H' },
  { label: 'Semana', value: 'semana', key: 'S' },
  { label: 'Mês',    value: 'mes',    key: 'M' },
]

const STORAGE_KEY = 'ryan-dashboard-periodo'

export function FiltroPeriodo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  const [optimistic, setOptimistic] = useState<string | null>(null)
  const [hasNewActivity, setHasNewActivity] = useState(false)

  const currentPeriodo = searchParams.get('periodo') ?? 'hoje'
  const activePeriodo = optimistic ?? currentPeriodo

  // Persistir e restaurar preferência
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved && saved !== currentPeriodo && !searchParams.has('periodo')) {
      router.push(`/visao-geral?periodo=${saved}`)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Indicador realtime — pisca quando chega novo agendamento hoje
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

  if (!isPending && optimistic && optimistic === currentPeriodo) {
    setOptimistic(null)
  }

  function setPeriodo(value: string) {
    setOptimistic(value)
    localStorage.setItem(STORAGE_KEY, value)
    startTransition(() => {
      router.push(`/visao-geral?periodo=${value}`)
    })
  }

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/60 transition-opacity duration-200',
      isPending && 'opacity-60 pointer-events-none'
    )}>
      {PRESETS.map(p => {
        const active = activePeriodo === p.value
        const showDot = p.value === 'hoje' && hasNewActivity
        return (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            disabled={isPending}
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
            {isPending && active && (
              <span className="absolute inset-0 rounded-lg overflow-hidden">
                <span className="absolute inset-0 bg-white/20 animate-pulse" />
              </span>
            )}
          </button>
        )
      })}
    </div>
  )
}
