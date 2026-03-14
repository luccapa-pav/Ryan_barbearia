'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  salvarConfiguracoes,
  atualizarHorario,
  criarBloqueio,
  deletarBloqueio,
} from '@/actions/configuracoes'
import { criarServico, atualizarServico, toggleServicoAtivo } from '@/actions/servicos'
import { formatarDiaSemana, formatarData, formatarMoeda } from '@/lib/utils'
import { Plus, Trash2, Check, X } from 'lucide-react'
import type { Servico, HorarioTrabalho, Bloqueio } from '@/lib/supabase/types'

interface ConfiguracoesPageClientProps {
  servicos: Servico[]
  horarios: HorarioTrabalho[]
  bloqueios: Bloqueio[]
  configuracoes: Record<string, string>
}

type Tab = 'geral' | 'horarios' | 'servicos' | 'bloqueios'

export function ConfiguracoesPageClient({
  servicos,
  horarios,
  bloqueios,
  configuracoes,
}: ConfiguracoesPageClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<Tab>('geral')

  const tabs: { id: Tab; label: string }[] = [
    { id: 'geral', label: 'Geral' },
    { id: 'horarios', label: 'Horários' },
    { id: 'servicos', label: 'Serviços' },
    { id: 'bloqueios', label: 'Bloqueios' },
  ]

  return (
    <div className="space-y-6 animate-fade-up">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Configurações</h2>
        <p className="text-muted-foreground text-sm mt-1">Gerencie as configurações da barbearia</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-amber-500 text-amber-500'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'geral' && (
          <GeralTab configuracoes={configuracoes} onSave={() => router.refresh()} />
        )}
        {activeTab === 'horarios' && (
          <HorariosTab horarios={horarios} onSave={() => router.refresh()} />
        )}
        {activeTab === 'servicos' && (
          <ServicosTab servicos={servicos} onSave={() => router.refresh()} />
        )}
        {activeTab === 'bloqueios' && (
          <BloqueiosTab bloqueios={bloqueios} onSave={() => router.refresh()} />
        )}
      </div>
    </div>
  )
}

// ============================================================
// Geral Tab
// ============================================================
function GeralTab({ configuracoes, onSave }: { configuracoes: Record<string, string>; onSave: () => void }) {
  const [values, setValues] = useState({ ...configuracoes })
  const [loading, setLoading] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await salvarConfiguracoes(values)
    if (result.success) {
      toast.success('Configurações salvas!')
      onSave()
    } else {
      toast.error(result.error ?? 'Erro ao salvar')
    }
    setLoading(false)
  }

  const fields = [
    { key: 'barbeiro_nome', label: 'Nome do barbeiro', type: 'text' },
    { key: 'barbeiro_telefone', label: 'Telefone do barbeiro', type: 'tel' },
    { key: 'intervalo_agendamento', label: 'Intervalo entre slots (minutos)', type: 'number' },
    { key: 'antecedencia_minima', label: 'Antecedência mínima (minutos)', type: 'number' },
    { key: 'antecedencia_maxima', label: 'Antecedência máxima (dias)', type: 'number' },
    { key: 'lembrete_dia_hora', label: 'Horário do lembrete diário', type: 'time' },
    { key: 'mensagem_boas_vindas', label: 'Mensagem de boas-vindas (WhatsApp)', type: 'textarea' },
  ]

  return (
    <form onSubmit={handleSave} className="max-w-xl space-y-5">
      {fields.map(field => (
        <div key={field.key} className="space-y-1.5">
          <label className="text-sm font-medium text-foreground">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              value={values[field.key] ?? ''}
              onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50 resize-none"
            />
          ) : (
            <input
              type={field.type}
              value={values[field.key] ?? ''}
              onChange={(e) => setValues(v => ({ ...v, [field.key]: e.target.value }))}
              className="w-full px-3 py-2 rounded-md bg-card border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm rounded-md transition-colors disabled:opacity-50"
      >
        {loading ? 'Salvando...' : 'Salvar configurações'}
      </button>
    </form>
  )
}

// ============================================================
// Horários Tab
// ============================================================
function HorariosTab({ horarios, onSave }: { horarios: HorarioTrabalho[]; onSave: () => void }) {
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValues, setEditValues] = useState({ hora_inicio: '', hora_fim: '', ativo: true })

  function startEdit(h: HorarioTrabalho) {
    setEditingId(h.id)
    setEditValues({ hora_inicio: h.hora_inicio, hora_fim: h.hora_fim, ativo: h.ativo })
  }

  async function saveEdit(id: string) {
    const result = await atualizarHorario(id, editValues)
    if (result.success) {
      toast.success('Horário atualizado!')
      setEditingId(null)
      onSave()
    } else {
      toast.error(result.error ?? 'Erro ao salvar')
    }
  }

  return (
    <div className="max-w-lg space-y-3">
      {horarios.map(h => (
        <div key={h.id} className="bg-card border border-border rounded-xl px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-foreground w-20">
                {formatarDiaSemana(h.dia_semana)}
              </span>
              {editingId === h.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="time"
                    value={editValues.hora_inicio}
                    onChange={(e) => setEditValues(v => ({ ...v, hora_inicio: e.target.value }))}
                    className="px-2 py-1 rounded bg-background border border-border text-sm text-foreground"
                  />
                  <span className="text-muted-foreground">–</span>
                  <input
                    type="time"
                    value={editValues.hora_fim}
                    onChange={(e) => setEditValues(v => ({ ...v, hora_fim: e.target.value }))}
                    className="px-2 py-1 rounded bg-background border border-border text-sm text-foreground"
                  />
                </div>
              ) : (
                <span className="text-sm text-muted-foreground">
                  {h.ativo ? `${h.hora_inicio} – ${h.hora_fim}` : 'Fechado'}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {editingId === h.id ? (
                <>
                  <button
                    onClick={() => saveEdit(h.id)}
                    className="p-1.5 rounded text-green-400 hover:bg-green-500/10"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="p-1.5 rounded text-muted-foreground hover:bg-secondary"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => startEdit(h)}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    Editar
                  </button>
                  <button
                    onClick={async () => {
                      const result = await atualizarHorario(h.id, { ativo: !h.ativo })
                      if (result.success) onSave()
                    }}
                    className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
                      h.ativo
                        ? 'text-green-400 border-green-500/30 bg-green-500/10'
                        : 'text-muted-foreground border-border bg-secondary'
                    }`}
                  >
                    {h.ativo ? 'Aberto' : 'Fechado'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ============================================================
// Serviços Tab
// ============================================================
function ServicosTab({ servicos, onSave }: { servicos: Servico[]; onSave: () => void }) {
  const [adding, setAdding] = useState(false)
  const [newServico, setNewServico] = useState({ nome: '', duracao_minutos: 30, preco: 0 })
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const result = await criarServico({
      nome: newServico.nome,
      duracao_minutos: newServico.duracao_minutos,
      preco: newServico.preco,
    })
    if (result.success) {
      toast.success('Serviço criado!')
      setAdding(false)
      setNewServico({ nome: '', duracao_minutos: 30, preco: 0 })
      onSave()
    } else {
      toast.error(result.error ?? 'Erro ao criar')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-lg space-y-3">
      {servicos.map(s => (
        <div key={s.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{s.nome}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {s.duracao_minutos}min · {formatarMoeda(s.preco)}
            </p>
          </div>
          <button
            onClick={async () => {
              const result = await toggleServicoAtivo(s.id, !s.ativo)
              if (result.success) onSave()
            }}
            className={`text-xs px-2 py-0.5 rounded-full border transition-colors ${
              s.ativo
                ? 'text-green-400 border-green-500/30 bg-green-500/10'
                : 'text-muted-foreground border-border bg-secondary'
            }`}
          >
            {s.ativo ? 'Ativo' : 'Inativo'}
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="bg-card border border-amber-500/30 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Novo serviço</p>
          <input
            type="text"
            placeholder="Nome do serviço"
            value={newServico.nome}
            onChange={(e) => setNewServico(v => ({ ...v, nome: e.target.value }))}
            required
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Duração (min)</label>
              <input
                type="number"
                min={5}
                value={newServico.duracao_minutos}
                onChange={(e) => setNewServico(v => ({ ...v, duracao_minutos: parseInt(e.target.value, 10) }))}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Preço (R$)</label>
              <input
                type="number"
                min={0}
                step={0.01}
                value={newServico.preco}
                onChange={(e) => setNewServico(v => ({ ...v, preco: parseFloat(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar serviço'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar serviço
        </button>
      )}
    </div>
  )
}

// ============================================================
// Bloqueios Tab
// ============================================================
function BloqueiosTab({ bloqueios, onSave }: { bloqueios: Bloqueio[]; onSave: () => void }) {
  const [adding, setAdding] = useState(false)
  const [newBloqueio, setNewBloqueio] = useState({ data_inicio: '', data_fim: '', motivo: '' })
  const [loading, setLoading] = useState(false)

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (newBloqueio.data_fim < newBloqueio.data_inicio) {
      toast.error('A data de fim deve ser igual ou posterior à data de início')
      return
    }
    setLoading(true)
    const result = await criarBloqueio({
      data_inicio: newBloqueio.data_inicio + 'T00:00:00',
      data_fim: newBloqueio.data_fim + 'T23:59:59',
      motivo: newBloqueio.motivo || null,
    })
    if (result.success) {
      toast.success('Bloqueio criado!')
      setAdding(false)
      setNewBloqueio({ data_inicio: '', data_fim: '', motivo: '' })
      onSave()
    } else {
      toast.error(result.error ?? 'Erro ao criar')
    }
    setLoading(false)
  }

  async function handleDelete(id: string) {
    const result = await deletarBloqueio(id)
    if (result.success) {
      toast.success('Bloqueio removido!')
      onSave()
    } else {
      toast.error(result.error ?? 'Erro ao remover')
    }
  }

  return (
    <div className="max-w-lg space-y-3">
      {bloqueios.length === 0 && !adding && (
        <p className="text-sm text-muted-foreground py-4">
          Nenhum bloqueio de data cadastrado.
        </p>
      )}

      {bloqueios.map(b => (
        <div key={b.id} className="bg-card border border-border rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-foreground">{b.motivo ?? 'Bloqueio'}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatarData(b.data_inicio)} – {formatarData(b.data_fim)}
            </p>
          </div>
          <button
            onClick={() => handleDelete(b.id)}
            className="p-1.5 rounded text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ))}

      {adding ? (
        <form onSubmit={handleAdd} className="bg-card border border-amber-500/30 rounded-xl p-5 space-y-3">
          <p className="text-sm font-medium text-foreground">Novo bloqueio</p>
          <input
            type="text"
            placeholder="Motivo (ex: Feriado, Férias)"
            value={newBloqueio.motivo}
            onChange={(e) => setNewBloqueio(v => ({ ...v, motivo: e.target.value }))}
            className="w-full px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground">Data início</label>
              <input
                type="date"
                required
                value={newBloqueio.data_inicio}
                onChange={(e) => setNewBloqueio(v => ({ ...v, data_inicio: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Data fim</label>
              <input
                type="date"
                required
                value={newBloqueio.data_fim}
                onChange={(e) => setNewBloqueio(v => ({ ...v, data_fim: e.target.value }))}
                className="w-full mt-1 px-3 py-2 rounded-md bg-background border border-border text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setAdding(false)}
              className="flex-1 py-2 rounded-md border border-border text-sm text-muted-foreground hover:text-foreground"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold text-sm disabled:opacity-50"
            >
              {loading ? 'Criando...' : 'Criar bloqueio'}
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-amber-500 hover:text-amber-400 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar bloqueio
        </button>
      )}
    </div>
  )
}
