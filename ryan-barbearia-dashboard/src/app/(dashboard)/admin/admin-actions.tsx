'use client'

import { useTransition, useState } from 'react'
import { UserCheck, UserX } from 'lucide-react'
import { aprovarUsuario, recusarUsuario } from '@/actions/auth'
import { toast } from 'sonner'

interface AdminActionsProps {
  userId: string
  nome: string
}

export function AdminActions({ userId, nome }: AdminActionsProps) {
  const [pendingAprovar, startAprovar] = useTransition()
  const [pendingRecusar, startRecusar] = useTransition()
  const [confirmando, setConfirmando] = useState(false)

  function handleAprovar() {
    startAprovar(async () => {
      await aprovarUsuario(userId)
      toast.success(`${nome} aprovado com sucesso!`)
    })
  }

  function handleRecusar() {
    startRecusar(async () => {
      await recusarUsuario(userId)
      toast.error(`${nome} foi recusado.`)
      setConfirmando(false)
    })
  }

  const disabled = pendingAprovar || pendingRecusar

  if (confirmando) {
    return (
      <div className="flex items-center gap-2 animate-fade-up">
        <span className="text-xs text-muted-foreground whitespace-nowrap">Confirmar recusa?</span>
        <button
          onClick={handleRecusar}
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 active:scale-95 text-white text-xs font-semibold transition-all disabled:opacity-50"
        >
          {pendingRecusar ? 'Recusando...' : 'Sim, recusar'}
        </button>
        <button
          onClick={() => setConfirmando(false)}
          disabled={disabled}
          className="px-3 py-1.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground text-xs font-semibold transition-all active:scale-95"
        >
          Cancelar
        </button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleAprovar}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 active:scale-95 text-white text-xs font-semibold transition-all duration-150 disabled:opacity-50"
      >
        <UserCheck className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{pendingAprovar ? 'Aprovando…' : 'Aprovar'}</span>
      </button>
      <button
        onClick={() => setConfirmando(true)}
        disabled={disabled}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-red-500/10 active:scale-95 border border-border hover:border-red-500/30 text-muted-foreground hover:text-red-500 text-xs font-semibold transition-all duration-150 disabled:opacity-50"
      >
        <UserX className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Recusar</span>
      </button>
    </div>
  )
}

export function ReativarAction({ userId, nome }: AdminActionsProps) {
  const [pending, startReativar] = useTransition()

  function handleReativar() {
    startReativar(async () => {
      await aprovarUsuario(userId)
      toast.success(`${nome} reativado com sucesso!`)
    })
  }

  return (
    <button
      onClick={handleReativar}
      disabled={pending}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card hover:bg-green-500/10 active:scale-95 border border-border hover:border-green-500/30 text-muted-foreground hover:text-green-600 text-xs font-semibold transition-all duration-150 disabled:opacity-50"
    >
      <UserCheck className="h-3.5 w-3.5" />
      <span className="hidden sm:inline">{pending ? 'Reativando…' : 'Reativar'}</span>
    </button>
  )
}
