function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-muted/70 ${className ?? ''}`} />
  )
}

function CardSkeleton() {
  return (
    <div className="bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card p-5 flex flex-col items-center gap-4">
      <Skeleton className="w-9 h-9 rounded-xl" />
      <Skeleton className="w-20 h-3" />
      <Skeleton className="w-14 h-7" />
      <Skeleton className="w-24 h-3" />
    </div>
  )
}

export default function VisaoGeralLoading() {
  return (
    <div className="space-y-8">
      {/* Header skeleton */}
      <div className="flex flex-col items-center gap-3">
        <Skeleton className="w-48 h-12" />
        <Skeleton className="w-32 h-4" />
        <Skeleton className="w-44 h-9 rounded-xl" />
      </div>

      {/* Section label */}
      <div className="space-y-3">
        <Skeleton className="w-32 h-4 mx-auto" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>

      {/* Section label */}
      <div className="space-y-3">
        <Skeleton className="w-36 h-4 mx-auto" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </div>

      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card p-5 space-y-4">
          <Skeleton className="w-40 h-4 mx-auto" />
          <div className="space-y-3 pt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-20 h-3" />
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton className="w-5 h-3" />
              </div>
            ))}
          </div>
        </div>
        <div className="bg-card rounded-xl border border-zinc-300 dark:border-zinc-600 shadow-card p-5 space-y-4">
          <Skeleton className="w-44 h-4 mx-auto" />
          <div className="space-y-3 pt-1">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="w-32 h-3" />
                <Skeleton className="flex-1 h-2 rounded-full" />
                <Skeleton className="w-5 h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
