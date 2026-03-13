/**
 * slots.ts — Shared slot calculation logic
 *
 * Used by:
 * - Dashboard Server Actions (agendamentos.ts)
 * - n8n via Supabase Edge Function (or direct call)
 *
 * Given work hours, existing appointments, and blocked periods,
 * calculates available time slots for a given date and service duration.
 */

import { addMinutes, format, parseISO, isWithinInterval, startOfDay, endOfDay, isBefore, isAfter } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export interface SlotInput {
  /** Target date in ISO format (YYYY-MM-DD) */
  data: string
  /** Service duration in minutes */
  duracaoMinutos: number
  /** Work hours for the day_of_week */
  horario: {
    hora_inicio: string  // "HH:MM"
    hora_fim: string     // "HH:MM"
  } | null
  /** Blocked periods (holidays, vacations) */
  bloqueios: Array<{
    data_inicio: string
    data_fim: string
  }>
  /** Existing appointments for that day (non-cancelled) */
  agendamentosExistentes: Array<{
    data_hora: string
    duracao_minutos: number
  }>
  /** Slot interval in minutes (from config, default 30) */
  intervaloMinutos: number
  /** Minimum lead time in minutes (from config, default 60) */
  antecedenciaMinima: number
}

export interface SlotDisponivel {
  hora: string           // "HH:MM"
  dataHoraISO: string    // Full ISO datetime
  label: string          // Human-readable: "14:00"
}

export function calcularSlots(input: SlotInput): SlotDisponivel[] {
  const { data, duracaoMinutos, horario, bloqueios, agendamentosExistentes, intervaloMinutos, antecedenciaMinima } = input

  // If no work schedule for this day, no slots
  if (!horario) return []

  const dataObj = parseISO(data)
  const dayStart = startOfDay(dataObj)
  const dayEnd = endOfDay(dataObj)

  // Check if entire day is blocked
  for (const bloqueio of bloqueios) {
    const bloqueioInicio = parseISO(bloqueio.data_inicio)
    const bloqueioFim = parseISO(bloqueio.data_fim)
    if (
      isWithinInterval(dayStart, { start: bloqueioInicio, end: bloqueioFim }) ||
      isWithinInterval(dayEnd, { start: bloqueioInicio, end: bloqueioFim }) ||
      (isBefore(bloqueioInicio, dayStart) && isAfter(bloqueioFim, dayEnd))
    ) {
      return []
    }
  }

  // Build the time range for the day
  const [startHour, startMin] = horario.hora_inicio.split(':').map(Number)
  const [endHour, endMin] = horario.hora_fim.split(':').map(Number)

  const workStart = new Date(dataObj)
  workStart.setHours(startHour!, startMin!, 0, 0)

  const workEnd = new Date(dataObj)
  workEnd.setHours(endHour!, endMin!, 0, 0)

  const now = new Date()
  const minStartTime = addMinutes(now, antecedenciaMinima)

  const slots: SlotDisponivel[] = []
  let current = new Date(workStart)

  while (current < workEnd) {
    const slotEnd = addMinutes(current, duracaoMinutos)

    // Slot must end before work ends
    if (slotEnd > workEnd) break

    // Slot must be in the future (respecting lead time)
    if (isAfter(current, minStartTime) || current.getTime() === minStartTime.getTime()) {
      // Check for conflicts with existing appointments
      const hasConflict = agendamentosExistentes.some(appt => {
        const apptStart = parseISO(appt.data_hora)
        const apptEnd = addMinutes(apptStart, appt.duracao_minutos)

        // Overlap check: new slot overlaps with existing appointment
        return current < apptEnd && slotEnd > apptStart
      })

      // Check if slot is within a blocked period
      const isBlocked = bloqueios.some(bloqueio => {
        const bloqueioInicio = parseISO(bloqueio.data_inicio)
        const bloqueioFim = parseISO(bloqueio.data_fim)
        return isWithinInterval(current, { start: bloqueioInicio, end: bloqueioFim })
      })

      if (!hasConflict && !isBlocked) {
        const hora = format(current, 'HH:mm')
        slots.push({
          hora,
          dataHoraISO: current.toISOString(),
          label: hora,
        })
      }
    }

    current = addMinutes(current, intervaloMinutos)
  }

  return slots
}

/**
 * Get available dates for the next N days
 * Returns only dates that have at least 1 available slot
 */
export function getDatasDisponiveis(
  diasFuturos: number,
  horarios: Array<{ dia_semana: number; hora_inicio: string; hora_fim: string; ativo: boolean }>,
  bloqueios: Array<{ data_inicio: string; data_fim: string }>,
  agendamentos: Array<{ data_hora: string; duracao_minutos: number }>,
  duracaoServico: number,
  intervaloMinutos: number,
  antecedenciaMinima: number
): string[] {
  const datas: string[] = []
  const now = new Date()

  for (let i = 0; i <= diasFuturos; i++) {
    const data = new Date(now)
    data.setDate(data.getDate() + i)
    const dataStr = format(data, 'yyyy-MM-dd')
    const diaSemana = data.getDay()

    const horario = horarios.find(h => h.dia_semana === diaSemana && h.ativo) ?? null

    // Filter appointments for this day
    const agendamentosNoDia = agendamentos.filter(a => {
      return a.data_hora.startsWith(dataStr)
    })

    const slots = calcularSlots({
      data: dataStr,
      duracaoMinutos: duracaoServico,
      horario: horario ? { hora_inicio: horario.hora_inicio, hora_fim: horario.hora_fim } : null,
      bloqueios,
      agendamentosExistentes: agendamentosNoDia,
      intervaloMinutos,
      antecedenciaMinima,
    })

    if (slots.length > 0) {
      datas.push(dataStr)
    }
  }

  return datas
}

/**
 * Format a date string for display in WhatsApp messages
 */
export function formatarDataParaWhatsApp(dataStr: string): string {
  return format(parseISO(dataStr), "EEEE, dd 'de' MMMM", { locale: ptBR })
}
