interface LeadCRM {
  status: string | null
  servicos: string | null
}

interface GraficoStatusProps {
  leads: LeadCRM[]
}

const STATUS_ITEMS = [
  { key: '1', label: 'Inicial' },
  { key: '2', label: 'Escolhendo' },
  { key: '3', label: 'Negociando' },
  { key: '4', label: 'Confirmado' },
]

export function GraficoStatus({ leads }: GraficoStatusProps) {
  const total = leads.length

  const porStatus = STATUS_ITEMS.map(({ key, label }) => ({
    key,
    label,
    count: leads.filter(l => l.status === key).length,
  }))

  const servicoMap: Record<string, number> = {}
  leads.forEach(l => {
    if (!l.servicos) return
    l.servicos.split(',').forEach(s => {
      const nome = s.trim()
      if (nome) servicoMap[nome] = (servicoMap[nome] ?? 0) + 1
    })
  })
  const topServicos = Object.entries(servicoMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
      {/* Funil */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Funil de Conversas
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Etapas do bot João</p>
        </div>

        {total === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhuma conversa no período
          </p>
        ) : (
          <div className="space-y-3">
            {porStatus.map(({ key, label, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0
              const isConfirmed = key === '4'
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        isConfirmed ? 'bg-primary' : 'bg-primary/30'
                      }`}
                      style={{ width: `${Math.max(pct, count > 0 ? 2 : 0)}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-5 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top serviços */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
        <div>
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
            Serviços Mais Pedidos
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">Extraído das conversas</p>
        </div>

        {topServicos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Nenhum serviço registrado
          </p>
        ) : (
          <div className="space-y-3">
            {topServicos.map(([nome, count]) => {
              const max = topServicos[0][1]
              const pct = (count / max) * 100
              return (
                <div key={nome} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{nome}</span>
                  <div className="flex-1 bg-muted/60 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-5 text-right tabular-nums">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
