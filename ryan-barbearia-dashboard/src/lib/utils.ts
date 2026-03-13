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
  pendente:  'bg-amber-50  text-amber-700  border-amber-200',
  confirmado:'bg-emerald-50 text-emerald-700 border-emerald-200',
  cancelado: 'bg-red-50    text-red-600    border-red-200',
  concluido: 'bg-blue-50   text-blue-700   border-blue-200',
  faltou:    'bg-violet-50 text-violet-700 border-violet-200',
}

export const ORIGEM_LABELS: Record<string, string> = {
  whatsapp: 'WhatsApp',
  dashboard: 'Dashboard',
  manual: 'Manual',
}
