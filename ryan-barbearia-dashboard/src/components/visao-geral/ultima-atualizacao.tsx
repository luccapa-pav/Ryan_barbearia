'use client'

import { useEffect, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

export function UltimaAtualizacao() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    setSegundos(0)
    const interval = setInterval(() => setSegundos(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [])

  function refresh() {
    startTransition(() => {
      router.refresh()
    })
    setSegundos(0)
  }

  const label = segundos < 5
    ? 'Agora mesmo'
    : segundos < 60
    ? `Há ${segundos}s`
    : `Há ${Math.floor(segundos / 60)}min`

  return (
    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
      <span>{label}</span>
      <button
        onClick={refresh}
        disabled={isPending}
        title="Atualizar dados"
        className="flex items-center gap-1 hover:text-foreground transition-colors disabled:opacity-50"
      >
        <RefreshCw className={cn('w-3 h-3', isPending && 'animate-spin')} />
        <span className="hidden sm:inline">Atualizar</span>
      </button>
    </div>
  )
}
