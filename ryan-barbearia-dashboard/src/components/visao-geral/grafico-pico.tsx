interface LeadCRM {
  status: string | null
  servicos: string | null
}

interface GraficoStatusProps {
  leads: LeadCRM[]
}

const STATUS_ITEMS = [
  { key: '1', label: 'Inicial',    bar: 'bg-muted-foreground/40' },
  { key: '2', label: 'Escolhendo', bar: 'bg-primary/40' },
  { key: '3', label: 'Negociando', bar: 'bg-primary/70' },
  { key: '4', label: 'Confirmado', bar: 'bg-primary' },
]

export function GraficoStatus({ leads }: GraficoStatusProps) {
  const total = leads.length

  const porStatus = STATUS_ITEMS.map(item => ({
    ...item,
    count: leads.filter(l => l.status === item.key).length,
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

  const maxServico = topServicos[0]?.[1] ?? 1

  const panelClass =
    'group bg-card rounded-xl border border-border hover:border-primary/35 shadow-card hover:shadow-elevated transition-all duration-200 hover:scale-[1.015] hover:-translate-y-0.5 p-5 space-y-4 overflow-hidden relative cursor-default'

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

      {/* Funil */}
      <div className={panelClass}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="flex flex-col items-center text-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            <p className="text-xs font-bold text-foreground uppercase tracking-widest font-gotham">
              Funil de Conversas
            </p>
            <span className="w-1 h-4 rounded-full bg-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground">Etapas do bot João</p>
        </div>

        {total === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-lg bg-muted/40 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Nenhuma conversa no período</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {porStatus.map(({ key, label, bar, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted/60 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-700 ease-out ${bar}`}
                      style={{ width: `${count > 0 ? Math.max(pct, 3) : 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-foreground w-6 text-right tabular-nums font-gotham">
                    {count}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top serviços */}
      <div className={panelClass}>
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        <div className="flex flex-col items-center text-center gap-0.5">
          <div className="flex items-center gap-2">
            <span className="w-1 h-4 rounded-full bg-primary" />
            <p className="text-xs font-bold text-foreground uppercase tracking-widest font-gotham">
              Serviços Mais Pedidos
            </p>
            <span className="w-1 h-4 rounded-full bg-primary" />
          </div>
          <p className="text-[11px] text-muted-foreground">Extraído das conversas</p>
        </div>

        {topServicos.length === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-lg bg-muted/40 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Nenhum serviço registrado</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {topServicos.map(([nome, count], i) => {
              const pct = (count / maxServico) * 100
              return (
                <div key={nome} className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 w-32 shrink-0">
                    <span className="text-xs font-black text-primary tabular-nums font-gotham">
                      {i + 1}.
                    </span>
                    <span className="text-xs font-medium text-muted-foreground truncate">{nome}</span>
                  </div>
                  <div className="flex-1 bg-muted/60 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary transition-all duration-700 ease-out"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-sm font-black text-foreground w-6 text-right tabular-nums font-gotham">
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
