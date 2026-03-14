import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { AgendamentoStatus } from './supabase/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Date formatters
// ============================================================
export function formatarData(data: string | Date): string {
  return format(new Date(data), "dd/MM/yyyy", { locale: ptBR })
}

export function formatarDataHora(data: string | Date): string {
  return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatarHora(data: string | Date): string {
  return format(new Date(data), 'HH:mm', { locale: ptBR })
}

export function formatarDataRelativa(data: string | Date): string {
  const d = new Date(data)
  if (isToday(d)) return `Hoje às ${formatarHora(d)}`
  if (isTomorrow(d)) return `Amanhã às ${formatarHora(d)}`
  return formatarDataHora(d)
}

export function formatarDistancia(data: string | Date): string {
  return formatDistanceToNow(new Date(data), { locale: ptBR, addSuffix: true })
}

export function formatarDiaSemana(diaSemana: number): string {
  const dias = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  return dias[diaSemana] ?? 'Desconhecido'
}

// ============================================================
// Currency formatter
// ============================================================
export function formatarMoeda(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor)
}

// ============================================================
// Phone formatter
// ============================================================
export function formatarTelefone(telefone: string): string {
  const digits = telefone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return telefone
}

// ============================================================
// Status helpers
// ============================================================
export const STATUS_LABELS: Record<AgendamentoStatus, string> = {
  pendente: 'Pendente',
  confirmado: 'Confirmado',
  cancelado: 'Cancelado',
  concluido: 'Concluído',
  faltou: 'Faltou',
}

export const STATUS_COLORS: Record<AgendamentoStatus, string> = {
  pendente:  'bg-amber-100   text-amber-800   border-amber-300   dark:bg-amber-500/20  dark:text-amber-300  dark:border-amber-500/40',
  confirmado:'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/40',
  cancelado: 'bg-red-100     text-red-700     border-red-300     dark:bg-red-500/20    dark:text-red-400    dark:border-red-500/40',
  concluido: 'bg-sky-100     text-sky-800     border-sky-300     dark:bg-sky-500/20    dark:text-sky-300    dark:border-sky-500/40',
  faltou:    'bg-violet-100  text-violet-800  border-violet-300  dark:bg-violet-500/20 dark:text-violet-300 dark:border-violet-500/40',
}

export const ORIGEM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  dashboard: 'Dashboard',
  manual: 'Manual',
}
