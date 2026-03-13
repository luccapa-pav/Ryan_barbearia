'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useTransition, useState } from 'react'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: 'Hoje',   value: 'hoje' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mês',    value: 'mes' },
]

export function FiltroPeriodo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()
  // Estado otimista: mostra o botão como ativo imediatamente ao clicar
  const [optimistic, setOptimistic] = useState<string | null>(null)

  const currentPeriodo = searchParams.get('periodo') ?? 'hoje'
  const activePeriodo = optimistic ?? currentPeriodo

  function setPeriodo(value: string) {
    setOptimistic(value)
    startTransition(() => {
      router.push(`/visao-geral?periodo=${value}`)
    })
  }

  // Limpa o estado otimista quando a navegação termina
  if (!isPending && optimistic && optimistic === currentPeriodo) {
    setOptimistic(null)
  }

  return (
    <div className={cn(
      'flex items-center gap-1 rounded-xl bg-muted/60 p-1 border border-border/60 transition-opacity duration-200',
      isPending && 'opacity-60 pointer-events-none'
    )}>
      {PRESETS.map(p => {
        const active = activePeriodo === p.value
        return (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            disabled={isPending}
            className={cn(
              'relative px-4 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 active:scale-95 hover:scale-105 font-gotham uppercase',
              active
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/80'
            )}
          >
            {p.label}
            {/* Indicador de loading no botão ativo */}
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
