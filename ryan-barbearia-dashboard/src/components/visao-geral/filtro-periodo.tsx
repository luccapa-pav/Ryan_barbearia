'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const PRESETS = [
  { label: 'Hoje',   value: 'hoje' },
  { label: 'Semana', value: 'semana' },
  { label: 'Mês',    value: 'mes' },
]

export function FiltroPeriodo() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const periodo = searchParams.get('periodo') ?? 'hoje'
  const temCustom = searchParams.has('de') && searchParams.has('ate')

  return (
    <div className="flex items-center gap-1 rounded-lg bg-muted/60 p-1 border border-border/50">
      {PRESETS.map(p => {
        const active = !temCustom && periodo === p.value
        return (
          <button
            key={p.value}
            onClick={() => router.push(`/visao-geral?periodo=${p.value}`)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150 active:scale-95',
              active
                ? 'bg-card text-foreground shadow-sm border border-border/60'
                : 'text-muted-foreground hover:text-foreground hover:bg-card/60'
            )}
          >
            {p.label}
          </button>
        )
      })}
    </div>
  )
}
