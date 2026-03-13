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

  function setPeriodo(value: string) {
    router.push(`/visao-geral?periodo=${value}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
        {PRESETS.map(p => (
          <button
            key={p.value}
            onClick={() => setPeriodo(p.value)}
            className={cn(
              'px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-150',
              !temCustom && periodo === p.value
                ? 'bg-card text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  )
}
