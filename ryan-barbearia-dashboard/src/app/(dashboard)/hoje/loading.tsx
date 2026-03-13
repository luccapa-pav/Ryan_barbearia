export default function HojeLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="space-y-2">
        <div className="h-4 w-40 bg-secondary rounded" />
        <div className="h-8 w-48 bg-secondary rounded" />
      </div>
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-24 bg-card border border-border rounded-xl" />
        ))}
      </div>
      <div className="h-96 bg-card border border-border rounded-xl" />
    </div>
  )
}
