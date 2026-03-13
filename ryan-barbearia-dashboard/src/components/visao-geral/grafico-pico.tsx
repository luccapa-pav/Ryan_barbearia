interface LeadCRM {
  status: string | null
  servicos: string | null
}

interface GraficoStatusProps {
  leads: LeadCRM[]
}

const STATUS_ITEMS = [
  { key: '1', label: 'Inicial',    pct_color: 'bg-muted-foreground/30' },
  { key: '2', label: 'Escolhendo', pct_color: 'bg-primary/40' },
  { key: '3', label: 'Negociando', pct_color: 'bg-primary/65' },
  { key: '4', label: 'Confirmado', pct_color: 'bg-primary' },
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">

      {/* Funil de conversas */}
      <div className="group bg-card rounded-xl border border-border hover:border-primary/20 shadow-card hover:shadow-elevated transition-all duration-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-0.5 h-3.5 rounded-full bg-primary inline-block" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Funil de Conversas
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Etapas do bot João</p>
          </div>
        </div>

        {total === 0 ? (
          <div className="flex items-center justify-center h-24 rounded-lg bg-muted/40 border border-dashed border-border">
            <p className="text-sm text-muted-foreground">Nenhuma conversa no período</p>
          </div>
        ) : (
          <div className="space-y-3 pt-1">
            {porStatus.map(({ key, label, pct_color, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={key} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-700 ease-out ${pct_color}`}
                      style={{ width: `${count > 0 ? Math.max(pct, 3) : 0}%` }}
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
      <div className="group bg-card rounded-xl border border-border hover:border-primary/20 shadow-card hover:shadow-elevated transition-all duration-200 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-0.5 h-3.5 rounded-full bg-primary inline-block" />
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">
              Serviços Mais Pedidos
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">Extraído das conversas</p>
          </div>
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
                    <span className="text-[10px] font-bold text-primary/60 tabular-nums w-3">
                      {i + 1}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">{nome}</span>
                  </div>
                  <div className="flex-1 bg-muted/50 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-1.5 rounded-full bg-primary transition-all duration-700 ease-out"
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
