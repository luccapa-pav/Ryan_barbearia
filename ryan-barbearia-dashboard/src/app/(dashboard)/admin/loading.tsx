function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted/70 ${className ?? ''}`} />
}

function UserCardSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60">
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-3 w-48" />
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

export default function AdminLoading() {
  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-56" />
        </div>
      </div>

      {/* Section */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-6 rounded-full" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => <UserCardSkeleton key={i} />)}
        </div>
      </div>
    </div>
  )
}
