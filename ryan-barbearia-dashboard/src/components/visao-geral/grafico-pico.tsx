interface LeadCRM {
  status: string | null
  servicos: string | null
}

interface GraficoStatusProps {
  leads: LeadCRM[]
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  '1': { label: 'Inicial',      color: 'fill-muted-foreground/40' },
  '2': { label: 'Escolhendo',   color: 'fill-sky-500/60' },
  '3': { label: 'Negociando',   color: 'fill-orange-500/70' },
  '4': { label: 'Confirmado',   color: 'fill-primary' },
}

export function GraficoStatus({ leads }: GraficoStatusProps) {
  const total = leads.length

  const porStatus = Object.entries(STATUS_LABELS).map(([status, meta]) => ({
    status,
    ...meta,
    count: leads.filter(l => l.status === status).length,
  }))

  // Top serviços: parsear coluna "Corte, Sobrancelha" → contagem
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

  const maxCount = Math.max(...porStatus.map(s => s.count), 1)
  const H = 80
  const BAR_W = 48
  const GAP = 16

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Funil de status */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Funil de Conversas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Distribuição por etapa do bot</p>
        </div>

        {total === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            Nenhuma conversa no período
          </div>
        ) : (
          <div className="space-y-2">
            {porStatus.map(({ status, label, count }) => {
              const pct = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-20 shrink-0">{label}</span>
                  <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        status === '4' ? 'bg-primary' :
                        status === '3' ? 'bg-orange-500' :
                        status === '2' ? 'bg-sky-500' : 'bg-muted-foreground/40'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top serviços */}
      <div className="bg-card rounded-xl border border-border shadow-card p-5 space-y-4">
        <div>
          <h3 className="font-display font-semibold text-foreground text-sm">Serviços Mais Pedidos</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Extraído das conversas confirmadas</p>
        </div>

        {topServicos.length === 0 ? (
          <div className="flex items-center justify-center h-20 text-muted-foreground text-sm">
            Nenhum serviço registrado
          </div>
        ) : (
          <div className="space-y-2">
            {topServicos.map(([nome, count]) => {
              const max = topServicos[0][1]
              const pct = (count / max) * 100
              return (
                <div key={nome} className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground w-28 truncate shrink-0">{nome}</span>
                  <div className="flex-1 bg-muted/40 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-2 rounded-full bg-primary/70 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-foreground w-6 text-right">{count}</span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
