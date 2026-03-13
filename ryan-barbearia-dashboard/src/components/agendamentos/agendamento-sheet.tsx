'use client'

import { useState, useEffect, useRef } from 'react'
import {
  X, Search, User, Scissors, ChevronLeft, ChevronRight, Clock,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, isSameDay, isToday, addMonths, subMonths,
  isBefore, startOfDay,
} from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { criarAgendamento, atualizarAgendamento, buscarSlotsDisponiveis } from '@/actions/agendamentos'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import type { AgendamentoComRelacoes, Servico, Cliente } from '@/lib/supabase/types'
import type { SlotDisponivel } from '@/lib/slots'

interface AgendamentoSheetProps {
  open: boolean
  onClose: () => void
  agendamento?: AgendamentoComRelacoes | null
  servicos: Servico[]
}

const DOW = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function AgendamentoSheet({ open, onClose, agendamento, servicos }: AgendamentoSheetProps) {
  const [loading, setLoading]               = useState(false)
  const [clienteSearch, setClienteSearch]   = useState('')
  const [clientes, setClientes]             = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedServico, setSelectedServico] = useState('')
  const [selectedData, setSelectedData]     = useState('')          // 'yyyy-MM-dd'
  const [calView, setCalView]               = useState<Date>(new Date())
  const [slots, setSlots]                   = useState<SlotDisponivel[]>([])
  const [selectedSlot, setSelectedSlot]     = useState('')
  const [observacoes, setObservacoes]       = useState('')
  const [loadingSlots, setLoadingSlots]     = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Fecha busca ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setClientes([])
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Preenche ao editar
  useEffect(() => {
    if (!open) return
    if (agendamento) {
      setSelectedCliente(agendamento.clientes as Cliente)
      setSelectedServico(agendamento.servico_id)
      const dataStr = agendamento.data_hora.slice(0, 10)
      setSelectedData(dataStr)
      setCalView(new Date(dataStr + 'T12:00:00'))
      setSelectedSlot(agendamento.data_hora)
      setObservacoes(agendamento.observacoes ?? '')
    } else {
      setSelectedCliente(null)
      setSelectedServico('')
      setSelectedData('')
      setSelectedSlot('')
      setObservacoes('')
      setSlots([])
      setCalView(new Date())
    }
    setClienteSearch('')
    setClientes([])
  }, [agendamento, open])

  // Busca clientes com debounce
  useEffect(() => {
    if (clienteSearch.length < 2) { setClientes([]); return }
    const t = setTimeout(async () => {
      const supabase = createClient()
      const { data } = await supabase
        .from('clientes')
        .select('*')
        .or(`nome.ilike.%${clienteSearch}%,telefone.ilike.%${clienteSearch}%`)
        .limit(5)
      setClientes(data ?? [])
    }, 300)
    return () => clearTimeout(t)
  }, [clienteSearch])

  // Busca slots ao mudar data ou serviço
  useEffect(() => {
    if (!selectedData || !selectedServico) { setSlots([]); return }
    setLoadingSlots(true)
    setSelectedSlot('')
    buscarSlotsDisponiveis(selectedData, selectedServico, agendamento?.id).then(r => {
      setSlots(r.slots ?? [])
      setLoadingSlots(false)
    })
  }, [selectedData, selectedServico, agendamento?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCliente || !selectedServico || !selectedSlot) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setLoading(true)
    try {
      const payload = {
        cliente_id: selectedCliente.id,
        servico_id: selectedServico,
        data_hora: selectedSlot,
        observacoes: observacoes || null,
      }
      const result = agendamento
        ? await atualizarAgendamento(agendamento.id, payload)
        : await criarAgendamento(payload)

      if (result.success) {
        toast.success(agendamento ? 'Agendamento atualizado!' : 'Agendamento criado!')
        onClose()
      } else {
        toast.error(result.error ?? 'Erro ao salvar')
      }
    } finally {
      setLoading(false)
    }
  }

  if (!open) return null

  // ── Calendário inline ──────────────────────────────────────────────────────
  const mStart   = startOfMonth(calView)
  const mEnd     = endOfMonth(calView)
  const monthDays = eachDayOfInterval({ start: mStart, end: mEnd })
  const startBlank = getDay(mStart) // 0=Dom
  const today    = new Date()
  const selected = selectedData ? new Date(selectedData + 'T12:00:00') : null

  function pickDay(day: Date) {
    if (isBefore(day, startOfDay(today))) return
    const str = format(day, 'yyyy-MM-dd')
    setSelectedData(str)
    setSelectedSlot('')
  }

  const servicoAtivo = servicos.find(s => s.id === selectedServico)

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Modal centralizado */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="pointer-events-auto w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-card rounded-2xl border border-border shadow-2xl flex flex-col animate-fade-up"
          onClick={e => e.stopPropagation()}
        >
          {/* ── Header ── */}
          <div className="sticky top-0 z-10 bg-card rounded-t-2xl border-b border-border">
            <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary via-primary/80 to-primary rounded-t-2xl" />
            <div className="px-6 py-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-gotham">
                  {agendamento ? 'Editar' : 'Novo'}
                </p>
                <h2 className="font-gotham font-black text-foreground text-xl leading-tight">
                  Agendamento
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 hover:scale-105"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* ── Linha 1: Cliente + Serviço (lado a lado em telas md+) ── */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* Cliente */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-foreground/70 uppercase tracking-widest font-gotham">
                  <User className="w-3 h-3" />
                  Cliente *
                </label>
                {selectedCliente ? (
                  <div className="flex items-center justify-between p-3.5 bg-primary/10 rounded-xl border border-primary/25">
                    <div>
                      <p className="text-sm font-bold text-foreground">{selectedCliente.nome}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{selectedCliente.telefone}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedCliente(null)}
                      className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div ref={searchRef} className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                    <input
                      type="text"
                      value={clienteSearch}
                      onChange={e => setClienteSearch(e.target.value)}
                      placeholder="Buscar por nome ou telefone..."
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
                    />
                    {clientes.length > 0 && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-card border border-border rounded-xl shadow-2xl z-20 overflow-hidden">
                        {clientes.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => { setSelectedCliente(c); setClienteSearch(''); setClientes([]) }}
                            className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border/50 last:border-b-0"
                          >
                            <p className="text-sm font-semibold text-foreground">{c.nome}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{c.telefone}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Serviço */}
              <div className="space-y-2">
                <label className="flex items-center gap-1.5 text-xs font-extrabold text-foreground/70 uppercase tracking-widest font-gotham">
                  <Scissors className="w-3 h-3" />
                  Serviço *
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {servicos.map(s => {
                    const active = selectedServico === s.id
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => { setSelectedServico(s.id); setSelectedSlot('') }}
                        className={cn(
                          'flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-left transition-all duration-150 hover:scale-[1.01] active:scale-[0.99]',
                          active
                            ? 'bg-primary/10 border-primary/40 shadow-sm'
                            : 'border-border hover:border-border/80 hover:bg-muted/40'
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={cn(
                            'w-2 h-2 rounded-full shrink-0',
                            active ? 'bg-primary' : 'bg-muted-foreground/30'
                          )} />
                          <span className={cn(
                            'text-sm font-semibold',
                            active ? 'text-foreground' : 'text-foreground/80'
                          )}>
                            {s.nome}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-xs text-muted-foreground">{s.duracao_minutos}min</span>
                          <span className={cn(
                            'text-xs font-bold font-gotham',
                            active ? 'text-primary' : 'text-muted-foreground'
                          )}>
                            R${s.preco.toFixed(2)}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* ── Data e Horário ── */}
            <div className="space-y-3">
              <label className="flex items-center gap-1.5 text-xs font-extrabold text-foreground/70 uppercase tracking-widest font-gotham">
                <Clock className="w-3 h-3" />
                Data e Horário *
              </label>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                {/* Calendário inline */}
                <div className="bg-background rounded-xl border border-border p-4">
                  {/* Cabeçalho mês */}
                  <div className="flex items-center justify-between mb-4">
                    <button
                      type="button"
                      onClick={() => setCalView(d => subMonths(d, 1))}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <p className="text-sm font-gotham font-black text-foreground capitalize">
                      {format(calView, 'MMMM yyyy', { locale: ptBR })}
                    </p>
                    <button
                      type="button"
                      onClick={() => setCalView(d => addMonths(d, 1))}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dias da semana */}
                  <div className="grid grid-cols-7 mb-2">
                    {DOW.map(d => (
                      <div key={d} className="text-center text-[10px] font-bold text-muted-foreground uppercase py-1">
                        {d.charAt(0)}
                      </div>
                    ))}
                  </div>

                  {/* Grade de dias */}
                  <div className="grid grid-cols-7 gap-y-1">
                    {Array.from({ length: startBlank }).map((_, i) => <div key={`b${i}`} />)}
                    {monthDays.map(day => {
                      const isPast = isBefore(day, startOfDay(today))
                      const isSel  = selected ? isSameDay(day, selected) : false
                      const isTod  = isToday(day)
                      return (
                        <div key={day.toISOString()} className="flex items-center justify-center">
                          <button
                            type="button"
                            disabled={isPast}
                            onClick={() => pickDay(day)}
                            className={cn(
                              'w-8 h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center',
                              isPast && 'opacity-20 cursor-not-allowed',
                              isSel && 'bg-primary text-primary-foreground shadow-sm font-black',
                              !isSel && isTod && 'border-2 border-primary text-primary font-black',
                              !isSel && !isTod && !isPast && 'text-foreground hover:bg-muted hover:scale-110 active:scale-95'
                            )}
                          >
                            {format(day, 'd')}
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Data selecionada resumida */}
                  {selected && (
                    <p className="mt-3 text-center text-xs font-semibold text-primary capitalize">
                      {format(selected, "EEEE',' dd 'de' MMMM", { locale: ptBR })}
                    </p>
                  )}
                </div>

                {/* Slots de horário */}
                <div className="flex flex-col">
                  {!selectedData ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-muted-foreground gap-2 rounded-xl border border-dashed border-border">
                      <Clock className="w-8 h-8 opacity-25" />
                      <p className="text-xs font-semibold">
                        {!selectedServico ? 'Escolha um serviço e' : 'Escolha'} uma data
                      </p>
                    </div>
                  ) : loadingSlots ? (
                    <div className="grid grid-cols-3 gap-2">
                      {[...Array(9)].map((_, i) => (
                        <div key={i} className="h-10 rounded-xl bg-muted animate-pulse" />
                      ))}
                    </div>
                  ) : slots.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-8 text-muted-foreground gap-2 rounded-xl border border-dashed border-border">
                      <Clock className="w-8 h-8 opacity-25" />
                      <p className="text-xs font-semibold">Nenhum horário disponível</p>
                      <p className="text-[10px] text-muted-foreground/60">Tente outra data</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground font-gotham uppercase tracking-wider">
                        {slots.length} horário{slots.length !== 1 ? 's' : ''} disponível{slots.length !== 1 ? 'is' : ''}
                      </p>
                      <div className="grid grid-cols-3 gap-2 max-h-[220px] overflow-y-auto pr-1">
                        {slots.map(slot => (
                          <button
                            key={slot.dataHoraISO}
                            type="button"
                            onClick={() => setSelectedSlot(slot.dataHoraISO)}
                            className={cn(
                              'h-10 rounded-xl border text-sm font-bold font-gotham transition-all duration-150 hover:scale-105 active:scale-95',
                              selectedSlot === slot.dataHoraISO
                                ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                                : 'border-border text-foreground hover:border-primary/40 hover:bg-muted'
                            )}
                          >
                            {slot.hora}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Resumo data + hora selecionados */}
              {selectedSlot && servicoAtivo && (
                <div className="flex items-center gap-3 px-4 py-3 bg-primary/8 rounded-xl border border-primary/20">
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
                  <p className="text-sm font-semibold text-foreground">
                    <span className="text-primary font-gotham font-black capitalize">
                      {format(new Date(selectedSlot), "EEE',' dd MMM", { locale: ptBR })}
                    </span>
                    {' às '}
                    <span className="text-primary font-gotham font-black">
                      {format(new Date(selectedSlot), 'HH:mm')}
                    </span>
                    {' · '}
                    <span className="text-muted-foreground">{servicoAtivo.nome}</span>
                    {' · '}
                    <span className="text-muted-foreground">{servicoAtivo.duracao_minutos}min</span>
                  </p>
                </div>
              )}
            </div>

            {/* ── Observações ── */}
            <div className="space-y-2">
              <label className="text-xs font-extrabold text-foreground/70 uppercase tracking-widest font-gotham">
                Observações
              </label>
              <textarea
                value={observacoes}
                onChange={e => setObservacoes(e.target.value)}
                rows={2}
                placeholder="Alguma observação especial?"
                className="w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all resize-none"
              />
            </div>

            {/* ── Botões ── */}
            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95 hover:scale-[1.01]"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !selectedCliente || !selectedServico || !selectedSlot}
                className="flex-1 py-3 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-sm font-gotham uppercase tracking-wide"
              >
                {loading ? 'Salvando...' : agendamento ? 'Atualizar' : 'Criar Agendamento'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}
