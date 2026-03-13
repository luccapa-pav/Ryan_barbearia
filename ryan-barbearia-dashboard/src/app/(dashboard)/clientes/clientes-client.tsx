'use client'

import { useState, useMemo } from 'react'
import { Search, Users, UserPlus, CalendarCheck, Phone, X, Clock, CheckCircle, CalendarDays, Plus, DollarSign } from 'lucide-react'
import { format, isThisMonth } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'
import { formatarMoeda, formatarTelefone, STATUS_COLORS, STATUS_LABELS, cn } from '@/lib/utils'
import { criarCliente } from '@/actions/clientes'
import type { Cliente, AgendamentoComRelacoes } from '@/lib/supabase/types'

interface ClientesPageClientProps {
  clientes: Cliente[]
  agendamentos: AgendamentoComRelacoes[]
}

// Cores de avatar derivadas do nome
const AVATAR_COLORS = [
  'bg-primary/20 text-primary',
  'bg-blue-500/20 text-blue-400',
  'bg-violet-500/20 text-violet-400',
  'bg-emerald-500/20 text-emerald-400',
  'bg-rose-500/20 text-rose-400',
  'bg-amber-500/20 text-amber-400',
  'bg-cyan-500/20 text-cyan-400',
]

function avatarColor(nome: string) {
  let hash = 0
  for (let i = 0; i < nome.length; i++) hash = nome.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export function ClientesPageClient({ clientes, agendamentos }: ClientesPageClientProps) {
  const [search, setSearch]               = useState('')
  const [selected, setSelected]           = useState<Cliente | null>(null)
  const [novoOpen, setNovoOpen]           = useState(false)

  // Stats por cliente — computado uma vez
  const statsMap = useMemo(() => {
    const map: Record<string, {
      total: number
      concluidos: number
      totalGasto: number
      ultimaVisita: string | null
      servicos: AgendamentoComRelacoes[]
    }> = {}

    for (const a of agendamentos) {
      if (!map[a.cliente_id]) {
        map[a.cliente_id] = { total: 0, concluidos: 0, totalGasto: 0, ultimaVisita: null, servicos: [] }
      }
      const s = map[a.cliente_id]!
      s.total++
      s.servicos.push(a)
      if (a.status === 'concluido') {
        s.concluidos++
        s.totalGasto += a.servicos?.preco ?? 0
        if (!s.ultimaVisita || a.data_hora > s.ultimaVisita) s.ultimaVisita = a.data_hora
      }
    }
    return map
  }, [agendamentos])

  // Métricas globais
  const metricas = useMemo(() => {
    const now = new Date()
    const novosEsteMes = clientes.filter(c => isThisMonth(new Date(c.criado_em))).length
    const totalConcluidos = agendamentos.filter(a => a.status === 'concluido').length
    const receitaTotal = agendamentos
      .filter(a => a.status === 'concluido')
      .reduce((s, a) => s + (a.servicos?.preco ?? 0), 0)
    return { novosEsteMes, totalConcluidos, receitaTotal }
  }, [clientes, agendamentos])

  // Busca client-side instantânea
  const filtered = useMemo(() => {
    if (!search.trim()) return clientes
    const q = search.toLowerCase()
    return clientes.filter(c =>
      c.nome.toLowerCase().includes(q) || c.telefone.includes(q)
    )
  }, [clientes, search])

  return (
    <div className="space-y-6 animate-fade-up">

      {/* ── Header ── */}
      <div className="relative flex flex-col items-center text-center gap-3">
        <div>
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Clientes</h2>
          <p className="text-base font-semibold text-muted-foreground tracking-wide mt-1">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} cadastrado{clientes.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setNovoOpen(true)}
          className="absolute right-0 top-0 flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 text-sm shadow-sm hover:scale-105 active:scale-95 font-gotham uppercase tracking-wide"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Novo</span>
        </button>

        {/* Busca centralizada */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-muted/60 border border-border/60 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: 'Total',
            value: clientes.length,
            icon: Users,
            iconBg: 'bg-zinc-100 dark:bg-zinc-800/60',
            iconColor: 'text-zinc-400',
          },
          {
            label: 'Novos este mês',
            value: metricas.novosEsteMes,
            icon: UserPlus,
            iconBg: 'bg-zinc-100 dark:bg-zinc-800/60',
            iconColor: 'text-zinc-400',
          },
          {
            label: 'Atendimentos',
            value: metricas.totalConcluidos,
            icon: CalendarCheck,
            iconBg: 'bg-emerald-50 dark:bg-emerald-500/20',
            iconColor: 'text-emerald-300 dark:text-emerald-400',
          },
        ].map(card => {
          const Icon = card.icon
          return (
            <div
              key={card.label}
              className="relative bg-card rounded-xl border border-border shadow-card p-5 flex flex-col items-center text-center gap-3 overflow-hidden"
            >
              <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
              <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', card.iconBg)}>
                <Icon className={cn('w-4 h-4', card.iconColor)} />
              </div>
              <div>
                <p className="text-[11px] font-extrabold text-foreground/70 uppercase tracking-widest font-gotham">{card.label}</p>
                <p className="text-2xl font-gotham font-black text-foreground tabular-nums leading-tight mt-1">{card.value}</p>
              </div>
            </div>
          )
        })}
      </div>

      {novoOpen && (
        <NovoClienteModal onClose={() => setNovoOpen(false)} />
      )}

      {/* ── Lista + Painel ── */}
      <div className={cn(
        'grid gap-5 transition-all',
        selected ? 'grid-cols-1 lg:grid-cols-5' : 'grid-cols-1'
      )}>

        {/* Lista de clientes */}
        <div className={selected ? 'lg:col-span-3' : ''}>
          {search && (
            <p className="text-xs text-muted-foreground mb-3 text-center">
              {filtered.length} resultado{filtered.length !== 1 ? 's' : ''} para &quot;{search}&quot;
            </p>
          )}

          {filtered.length === 0 ? (
            <div className="bg-card border border-border rounded-2xl p-16 flex flex-col items-center text-center gap-3">
              <Users className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm font-semibold text-muted-foreground">
                {search ? 'Nenhum cliente encontrado' : 'Nenhum cliente cadastrado ainda'}
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className="divide-y divide-border">
                {filtered.map(cliente => {
                  const stats = statsMap[cliente.id]
                  const isActive = selected?.id === cliente.id
                  const color = avatarColor(cliente.nome)

                  return (
                    <button
                      key={cliente.id}
                      onClick={() => setSelected(isActive ? null : cliente)}
                      className={cn(
                        'w-full px-5 py-4 flex items-center gap-4 text-left transition-all duration-150 hover:bg-muted/40',
                        isActive && 'bg-primary/5 border-l-2 border-primary'
                      )}
                    >
                      {/* Avatar */}
                      <div className={cn(
                        'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-gotham font-black text-sm',
                        color
                      )}>
                        {cliente.nome.charAt(0).toUpperCase()}
                      </div>

                      {/* Info principal */}
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-foreground text-sm truncate">{cliente.nome}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-muted-foreground shrink-0" />
                          <p className="text-xs text-muted-foreground">{formatarTelefone(cliente.telefone)}</p>
                        </div>
                      </div>

                      {/* Stats pills */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        {stats && stats.concluidos > 0 ? (
                          <>
                            <span className="text-xs font-bold text-primary font-gotham">
                              {stats.concluidos}x
                            </span>
                            <span className="text-[10px] text-muted-foreground font-semibold">
                              {formatarMoeda(stats.totalGasto)}
                            </span>
                          </>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50 font-semibold">
                            sem visitas
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Painel de detalhe */}
        {selected && (
          <div className="lg:col-span-2">
            <ClienteDetalhe
              cliente={selected}
              stats={statsMap[selected.id] ?? { total: 0, concluidos: 0, totalGasto: 0, ultimaVisita: null, servicos: [] }}
              onClose={() => setSelected(null)}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Painel de detalhe ─────────────────────────────────────────────────────────

interface ClienteDetalheProps {
  cliente: Cliente
  stats: {
    total: number
    concluidos: number
    totalGasto: number
    ultimaVisita: string | null
    servicos: AgendamentoComRelacoes[]
  }
  onClose: () => void
}

function ClienteDetalhe({ cliente, stats, onClose }: ClienteDetalheProps) {
  const color = avatarColor(cliente.nome)

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden sticky top-20">

      {/* Header do cliente */}
      <div className="px-5 py-4 border-b border-border">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-12 h-12 rounded-xl flex items-center justify-center shrink-0 font-gotham font-black text-lg',
              color
            )}>
              {cliente.nome.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-gotham font-black text-foreground">{cliente.nome}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Phone className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">{formatarTelefone(cliente.telefone)}</p>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-2 mt-4">
          {[
            { label: 'Visitas', value: stats.concluidos, icon: CheckCircle, color: 'text-emerald-400' },
            { label: 'Gasto', value: formatarMoeda(stats.totalGasto), icon: DollarSign, color: 'text-primary' },
            {
              label: 'Última',
              value: stats.ultimaVisita
                ? format(new Date(stats.ultimaVisita), 'dd/MM/yy')
                : '—',
              icon: Clock,
              color: 'text-muted-foreground',
            },
          ].map(item => {
            const Icon = item.icon
            return (
              <div key={item.label} className="bg-muted/40 rounded-xl p-3 text-center">
                <Icon className={cn('w-4 h-4 mx-auto mb-1', item.color)} />
                <p className="text-xs font-bold text-foreground truncate">{item.value}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-gotham uppercase tracking-wide">{item.label}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Histórico */}
      <div className="px-5 py-4">
        <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-gotham mb-3">
          Histórico de visitas
        </p>

        {stats.servicos.length === 0 ? (
          <div className="flex flex-col items-center py-8 text-muted-foreground gap-2">
            <CalendarDays className="w-7 h-7 opacity-25" />
            <p className="text-xs">Nenhum agendamento ainda</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {stats.servicos.map((a, i) => (
              <div
                key={a.id ?? i}
                className="flex items-center gap-3 py-2.5 border-b border-border/40 last:border-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-foreground truncate">
                    {a.servicos?.nome ?? 'Serviço'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {format(new Date(a.data_hora), "dd 'de' MMM yyyy · HH:mm", { locale: ptBR })}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={cn(
                    'text-[10px] font-bold font-gotham uppercase px-2 py-0.5 rounded-lg border',
                    STATUS_COLORS[a.status]
                  )}>
                    {STATUS_LABELS[a.status]}
                  </span>
                  {a.servicos?.preco && a.status === 'concluido' && (
                    <span className="text-[10px] font-bold text-primary">
                      {formatarMoeda(a.servicos.preco)}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Observações */}
      {cliente.observacoes && (
        <div className="px-5 py-3 border-t border-border bg-muted/20">
          <p className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest font-gotham mb-1.5">
            Observações
          </p>
          <p className="text-sm text-foreground/80 leading-relaxed">{cliente.observacoes}</p>
        </div>
      )}

      {/* Cliente desde */}
      <div className="px-5 py-3 border-t border-border">
        <p className="text-[10px] text-muted-foreground/60 text-center">
          Cliente desde {format(new Date(cliente.criado_em), "MMMM 'de' yyyy", { locale: ptBR })}
        </p>
      </div>
    </div>
  )
}

// ── Modal Novo Cliente ────────────────────────────────────────────────────────

function NovoClienteModal({ onClose }: { onClose: () => void }) {
  const [nome, setNome]               = useState('')
  const [telefone, setTelefone]       = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loading, setLoading]         = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim() || !telefone.trim()) return
    setLoading(true)
    try {
      const result = await criarCliente({
        nome: nome.trim(),
        telefone: telefone.trim(),
        observacoes: observacoes.trim() || null,
      })
      if (result.success) {
        toast.success('Cliente cadastrado!')
        onClose()
      } else {
        toast.error(result.error ?? 'Erro ao cadastrar')
      }
    } finally {
      setLoading(false)
    }
  }

  const color = nome ? avatarColor(nome) : 'bg-muted text-muted-foreground'

  return (
    <>
      <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-40" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-sm bg-card rounded-2xl border border-border shadow-2xl flex flex-col animate-fade-up"
          onClick={e => e.stopPropagation()}
        >
          {/* Faixa laranja topo */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-t-2xl" />

          {/* Header com avatar preview */}
          <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-border">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-11 h-11 rounded-xl flex items-center justify-center font-gotham font-black text-base transition-all duration-200',
                color
              )}>
                {nome ? nome.charAt(0).toUpperCase() : <Users className="w-5 h-5 opacity-40" />}
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-gotham">Novo</p>
                <p className="font-gotham font-black text-foreground text-lg leading-tight">
                  {nome.trim() || 'Cliente'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-3">

            {/* Nome */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus-within:border-primary/40 transition-colors">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={nome}
                onChange={e => setNome(e.target.value)}
                placeholder="Nome completo"
                required
                autoFocus
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Telefone */}
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus-within:border-primary/40 transition-colors">
              <Phone className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="tel"
                value={telefone}
                onChange={e => setTelefone(e.target.value)}
                placeholder="(00) 00000-0000"
                required
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
            </div>

            {/* Observações */}
            <div className="flex gap-3 px-4 py-3 rounded-xl bg-muted/40 border border-border/60 focus-within:border-primary/40 transition-colors">
              <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                placeholder="Observações (opcional)"
                rows={2}
                className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none resize-none"
              />
            </div>

            {/* Botões */}
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl bg-muted/60 hover:bg-muted text-sm font-semibold text-muted-foreground hover:text-foreground transition-all active:scale-95 border border-border/50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !nome.trim() || !telefone.trim()}
                className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 font-gotham uppercase tracking-wide shadow-sm"
              >
                {loading ? 'Salvando...' : 'Cadastrar'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
