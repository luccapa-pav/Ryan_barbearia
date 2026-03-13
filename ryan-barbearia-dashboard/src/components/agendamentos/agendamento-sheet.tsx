'use client'

import { useState, useEffect } from 'react'
import { X, Search, CalendarDays, Clock, User, Scissors } from 'lucide-react'
import { toast } from 'sonner'
import { criarAgendamento, atualizarAgendamento, buscarSlotsDisponiveis } from '@/actions/agendamentos'
import { createClient } from '@/lib/supabase/client'
import { formatarData, cn } from '@/lib/utils'
import type { AgendamentoComRelacoes, Servico, Cliente } from '@/lib/supabase/types'
import type { SlotDisponivel } from '@/lib/slots'

interface AgendamentoSheetProps {
  open: boolean
  onClose: () => void
  agendamento?: AgendamentoComRelacoes | null
  servicos: Servico[]
}

const inputClass = 'w-full px-3 py-2.5 rounded-xl bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all'
const labelClass = 'flex items-center gap-1.5 text-xs font-extrabold text-foreground/80 uppercase tracking-widest font-gotham'

export function AgendamentoSheet({ open, onClose, agendamento, servicos }: AgendamentoSheetProps) {
  const [loading, setLoading] = useState(false)
  const [clienteSearch, setClienteSearch] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [selectedServico, setSelectedServico] = useState('')
  const [selectedData, setSelectedData] = useState('')
  const [slots, setSlots] = useState<SlotDisponivel[]>([])
  const [selectedSlot, setSelectedSlot] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    if (agendamento) {
      setSelectedCliente(agendamento.clientes as Cliente)
      setSelectedServico(agendamento.servico_id)
      setSelectedData(agendamento.data_hora.split('T')[0]!)
      setSelectedSlot(agendamento.data_hora)
      setObservacoes(agendamento.observacoes ?? '')
    } else {
      setSelectedCliente(null)
      setSelectedServico('')
      setSelectedData('')
      setSelectedSlot('')
      setObservacoes('')
      setSlots([])
    }
    setClienteSearch('')
  }, [agendamento, open])

  async function searchClientes(q: string) {
    if (q.length < 2) { setClientes([]); return }
    const supabase = createClient()
    const { data } = await supabase
      .from('clientes')
      .select('*')
      .or(`nome.ilike.%${q}%,telefone.ilike.%${q}%`)
      .limit(5)
    setClientes(data ?? [])
  }

  useEffect(() => {
    const timeout = setTimeout(() => searchClientes(clienteSearch), 300)
    return () => clearTimeout(timeout)
  }, [clienteSearch])

  useEffect(() => {
    if (selectedData && selectedServico) {
      setLoadingSlots(true)
      buscarSlotsDisponiveis(selectedData, selectedServico, agendamento?.id).then(result => {
        setSlots(result.slots ?? [])
        setLoadingSlots(false)
      })
    } else {
      setSlots([])
    }
  }, [selectedData, selectedServico, agendamento?.id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedCliente || !selectedServico || !selectedSlot) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }
    setLoading(true)
    try {
      const result = agendamento
        ? await atualizarAgendamento(agendamento.id, {
            cliente_id: selectedCliente.id,
            servico_id: selectedServico,
            data_hora: selectedSlot,
            observacoes: observacoes || null,
          })
        : await criarAgendamento({
            cliente_id: selectedCliente.id,
            servico_id: selectedServico,
            data_hora: selectedSlot,
            observacoes: observacoes || null,
          })

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

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 animate-fade-up"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto flex flex-col shadow-elevated">

        {/* Header com acento laranja */}
        <div className="sticky top-0 bg-card z-10">
          <div className="absolute inset-x-0 top-0 h-0.5 bg-brand-gradient" />
          <div className="px-6 py-5 flex items-center justify-between border-b border-border">
            <div>
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-widest font-gotham">
                {agendamento ? 'Editar' : 'Novo'}
              </p>
              <h2 className="font-gotham font-black text-foreground text-lg leading-tight">
                Agendamento
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 p-6 space-y-5">

          {/* Cliente */}
          <div className="space-y-2">
            <label className={labelClass}>
              <User className="w-3 h-3" />
              Cliente *
            </label>
            {selectedCliente ? (
              <div className="flex items-center justify-between p-3 bg-primary/10 rounded-xl border border-primary/20">
                <div>
                  <p className="text-sm font-semibold text-foreground">{selectedCliente.nome}</p>
                  <p className="text-xs text-muted-foreground">{selectedCliente.telefone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCliente(null)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  value={clienteSearch}
                  onChange={(e) => setClienteSearch(e.target.value)}
                  placeholder="Buscar por nome ou telefone..."
                  className={cn(inputClass, 'pl-9')}
                />
                {clientes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-elevated z-10 overflow-hidden">
                    {clientes.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCliente(c)
                          setClienteSearch('')
                          setClientes([])
                        }}
                        className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors"
                      >
                        <p className="text-sm font-semibold text-foreground">{c.nome}</p>
                        <p className="text-xs text-muted-foreground">{c.telefone}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Serviço */}
          <div className="space-y-2">
            <label className={labelClass}>
              <Scissors className="w-3 h-3" />
              Serviço *
            </label>
            <select
              value={selectedServico}
              onChange={(e) => setSelectedServico(e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Selecione um serviço</option>
              {servicos.map(s => (
                <option key={s.id} value={s.id}>
                  {s.nome} — {s.duracao_minutos}min — R$ {s.preco.toFixed(2)}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div className="space-y-2">
            <label className={labelClass}>
              <CalendarDays className="w-3 h-3" />
              Data *
            </label>
            <input
              type="date"
              value={selectedData}
              onChange={(e) => { setSelectedData(e.target.value); setSelectedSlot('') }}
              min={new Date().toISOString().split('T')[0]}
              required
              className={inputClass}
            />
          </div>

          {/* Slots */}
          {selectedData && selectedServico && (
            <div className="space-y-2">
              <label className={labelClass}>
                <Clock className="w-3 h-3" />
                Horário *
              </label>
              {loadingSlots ? (
                <div className="grid grid-cols-4 gap-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-9 rounded-xl bg-muted animate-pulse" />
                  ))}
                </div>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhum horário disponível para {formatarData(selectedData)}.
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {slots.map(slot => (
                    <button
                      key={slot.dataHoraISO}
                      type="button"
                      onClick={() => setSelectedSlot(slot.dataHoraISO)}
                      className={cn(
                        'py-2 text-xs rounded-xl border font-bold transition-all duration-150 hover:scale-105 active:scale-95 font-gotham',
                        selectedSlot === slot.dataHoraISO
                          ? 'bg-primary border-primary text-primary-foreground shadow-brand'
                          : 'border-border text-foreground hover:border-primary/50 hover:bg-muted'
                      )}
                    >
                      {slot.hora}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Observações */}
          <div className="space-y-2">
            <label className={labelClass}>Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Alguma observação especial?"
              className={cn(inputClass, 'resize-none')}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-xl border border-border text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all active:scale-95"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCliente || !selectedServico || !selectedSlot}
              className="flex-1 py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm transition-all active:scale-95 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-brand font-gotham uppercase tracking-wide"
            >
              {loading ? 'Salvando...' : agendamento ? 'Atualizar' : 'Criar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
