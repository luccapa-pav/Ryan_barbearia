'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AgendamentoSheet } from '@/components/agendamentos/agendamento-sheet'
import { AgendamentosTable } from '@/components/agendamentos/agendamentos-table'
import type { AgendamentoComRelacoes, Servico } from '@/lib/supabase/types'

interface AgendamentosPageClientProps {
  agendamentos: AgendamentoComRelacoes[]
  servicos: Servico[]
  total: number
  pagina: number
  pageSize: number
}

export function AgendamentosPageClient({
  agendamentos,
  servicos,
  total,
  pagina,
  pageSize,
}: AgendamentosPageClientProps) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const [editingAgendamento, setEditingAgendamento] = useState<AgendamentoComRelacoes | null>(null)
  const router = useRouter()

  function handleEdit(agendamento: AgendamentoComRelacoes) {
    setEditingAgendamento(agendamento)
    setSheetOpen(true)
  }

  function handleNew() {
    setEditingAgendamento(null)
    setSheetOpen(true)
  }

  function handleClose() {
    setSheetOpen(false)
    setEditingAgendamento(null)
    router.refresh()
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Agendamentos</h2>
          <p className="text-muted-foreground text-sm mt-1">{total} agendamento{total !== 1 ? 's' : ''} no total</p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold rounded-md transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          Novo agendamento
        </button>
      </div>

      <AgendamentosTable
        agendamentos={agendamentos}
        total={total}
        pagina={pagina}
        pageSize={pageSize}
        onEdit={handleEdit}
      />

      <AgendamentoSheet
        open={sheetOpen}
        onClose={handleClose}
        agendamento={editingAgendamento}
        servicos={servicos}
      />
    </div>
  )
}
