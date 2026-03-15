'use client'

import { useMemo } from 'react'
import { getDay } from 'date-fns'
import { formatarMoeda, cn } from '@/lib/utils'
import type { AgendamentoComRelacoes } from '@/lib/supabase/types'

const DIAS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
// Reordena para semana começando na segunda
const ORDEM: number[] = [1, 2, 3, 4, 5, 6, 0]

interface GraficoReceitaSemanaProps {
  agendamentos: AgendamentoComRelacoes[]
}

export function GraficoReceitaSemana({ agendamentos: appts }: GraficoReceitaSemanaProps) {
  const dados = useMemo(() => {
    const receita = Array(7).fill(0) as number[]
    const qtd     = Array(7).fill(0) as number[]
    for (const a of appts) {
      if (a.status === 'cancelado' || a.status === 'faltou') continue
      // new Date() converte UTC→local; getDay() retorna o dia da semana no fuso do browser
      const dia = getDay(new Date(a.data_hora))
      receita[dia] += a.servicos?.preco ?? 0
      qtd[dia]++
    }
    return ORDEM.map(d => ({ dia: DIAS[d], receita: receita[d], qtd: qtd[d] }))
  }, [appts])

  const max = Math.max(...dados.map(d => d.receita), 1)
  const total = dados.reduce((s, d) => s + d.receita, 0)

  return (
    <div className="group bg-card rounded-xl border border-border hover:border-primary shadow-card hover:shadow-elevated transition-all duration-200 p-5 space-y-4 overflow-hidden relative cursor-default">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-gotham font-bold text-primary uppercase tracking-widest">
            Receita por dia da semana
          </p>
          <p className="text-[11px] text-muted-foreground">Agendamentos do período</p>
        </div>
        <p className="text-sm font-gotham font-black text-foreground tabular-nums">
          {formatarMoeda(total)}
        </p>
      </div>

      {total === 0 ? (
        <div className="flex items-center justify-center h-24 rounded-lg bg-muted/40 border border-dashed border-border">
          <p className="text-sm text-muted-foreground">Nenhuma receita no período</p>
        </div>
      ) : (
        <div className="flex items-end gap-2 h-28">
          {dados.map(({ dia, receita, qtd }) => {
            const pct = (receita / max) * 100
            const isTop = receita === max && receita > 0
            return (
              <div key={dia} className="flex-1 flex flex-col items-center gap-1.5" title={`${dia}: ${formatarMoeda(receita)} (${qtd} ag.)`}>
                <div className="w-full flex flex-col items-center justify-end h-20">
                  <div
                    className={cn(
                      'w-full rounded-t-lg transition-all duration-700 ease-out min-h-[4px]',
                      isTop ? 'bg-primary' : 'bg-primary/40'
                    )}
                    style={{ height: `${Math.max(pct, 4)}%` }}
                  />
                </div>
                <span className={cn(
                  'text-[10px] font-bold font-gotham uppercase tracking-wide',
                  isTop ? 'text-primary' : 'text-muted-foreground'
                )}>
                  {dia}
                </span>
                {qtd > 0 && (
                  <span className="text-[9px] text-muted-foreground/70 tabular-nums">{qtd}</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
