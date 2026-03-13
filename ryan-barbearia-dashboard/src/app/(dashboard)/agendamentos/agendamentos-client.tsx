'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, CalendarDays } from 'lucide-react'
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
    <div className="space-y-6 animate-fade-up">
      {/* Header centralizado — mesmo padrão da Visão Geral */}
      <div className="flex flex-col items-center text-center gap-4">
        <div>
          <h2 className="text-5xl font-gotham font-black text-foreground tracking-tight">Agendamentos</h2>
          <p className="text-base font-semibold text-muted-foreground tracking-wide mt-1">
            {total} agendamento{total !== 1 ? 's' : ''} no total
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl transition-all duration-200 text-sm shadow-brand hover:scale-105 active:scale-95 font-gotham uppercase tracking-wide"
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
