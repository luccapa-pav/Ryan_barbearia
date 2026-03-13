function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/70 ${className ?? ''}`} />
}

export default function AgendamentosLoading() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-64 h-12" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-44 h-10 rounded-xl" />
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="w-24 h-8 rounded-lg" />
        ))}
      </div>

      {/* Tabela */}
      <div className="bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card overflow-hidden">
        {/* Header */}
        <div className="flex gap-4 px-4 py-3 border-b border-border bg-muted/40">
          {[120, 160, 120, 80, 90, 70].map((w, i) => (
            <Skeleton key={i} className="h-3 rounded" style={{ width: w }} />
          ))}
        </div>
        {/* Rows */}
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex gap-4 px-4 py-3.5 border-b border-border/50">
            <Skeleton className="h-4 rounded" style={{ width: 120 }} />
            <div className="flex flex-col gap-1.5" style={{ width: 160 }}>
              <Skeleton className="h-4 rounded w-full" />
              <Skeleton className="h-3 rounded w-2/3" />
            </div>
            <Skeleton className="h-4 rounded" style={{ width: 120 }} />
            <Skeleton className="h-4 rounded" style={{ width: 80 }} />
            <Skeleton className="h-5 rounded-full" style={{ width: 90 }} />
            <Skeleton className="h-4 rounded" style={{ width: 70 }} />
          </div>
        ))}
      </div>
    </div>
  )
}
