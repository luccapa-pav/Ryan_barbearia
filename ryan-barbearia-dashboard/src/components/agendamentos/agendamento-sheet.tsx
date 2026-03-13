'use client'

import { useState, useEffect } from 'react'
import { X, Search } from 'lucide-react'
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
    if (q.length < 2) {
      setClientes([])
      return
    }
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
      buscarSlotsDisponiveis(
        selectedData,
        selectedServico,
        agendamento?.id
      ).then(result => {
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
      let result
      if (agendamento) {
        result = await atualizarAgendamento(agendamento.id, {
          cliente_id: selectedCliente.id,
          servico_id: selectedServico,
          data_hora: selectedSlot,
          observacoes: observacoes || null,
        })
      } else {
        result = await criarAgendamento({
          cliente_id: selectedCliente.id,
          servico_id: selectedServico,
          data_hora: selectedSlot,
          observacoes: observacoes || null,
        })
      }

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
        className="fixed inset-0 bg-black/60 z-40"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-50 overflow-y-auto">
        <div className="sticky top-0 bg-card border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-semibold text-foreground">
            {agendamento ? 'Editar agendamento' : 'Novo agendamento'}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Cliente */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Cliente *</label>
            {selectedCliente ? (
              <div className="flex items-center justify-between p-3 bg-secondary rounded-md">
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedCliente.nome}</p>
                  <p className="text-xs text-muted-foreground">{selectedCliente.telefone}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedCliente(null)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
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
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
                />
                {clientes.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-md shadow-lg z-10 overflow-hidden">
                    {clientes.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => {
                          setSelectedCliente(c)
                          setClienteSearch('')
                          setClientes([])
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-secondary transition-colors"
                      >
                        <p className="text-sm font-medium text-foreground">{c.nome}</p>
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
            <label className="text-sm font-medium text-foreground">Serviço *</label>
            <select
              value={selectedServico}
              onChange={(e) => setSelectedServico(e.target.value)}
              required
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
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
            <label className="text-sm font-medium text-foreground">Data *</label>
            <input
              type="date"
              value={selectedData}
              onChange={(e) => {
                setSelectedData(e.target.value)
                setSelectedSlot('')
              }}
              min={new Date().toISOString().split('T')[0]}
              required
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          </div>

          {/* Slots */}
          {selectedData && selectedServico && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Horário *</label>
              {loadingSlots ? (
                <p className="text-sm text-muted-foreground">Carregando horários...</p>
              ) : slots.length === 0 ? (
                <p className="text-sm text-muted-foreground">
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
                        'py-2 text-sm rounded-md border transition-colors font-medium',
                        selectedSlot === slot.dataHoraISO
                          ? 'bg-amber-500 border-amber-500 text-zinc-950'
                          : 'border-border text-foreground hover:border-amber-500/50 hover:bg-secondary'
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
            <label className="text-sm font-medium text-foreground">Observações</label>
            <textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={3}
              placeholder="Alguma observação especial?"
              className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || !selectedCliente || !selectedServico || !selectedSlot}
              className="flex-1 py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Salvando...' : agendamento ? 'Atualizar' : 'Criar agendamento'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}
