'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { AgendamentoInsert, AgendamentoUpdate } from '@/lib/supabase/types'

export async function criarAgendamento(data: Omit<AgendamentoInsert, 'origem'>) {
  const supabase = await createClient()

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .insert({ ...data, origem: 'dashboard' })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/visao-geral')
  revalidatePath('/hoje')
  revalidatePath('/agendamentos')
  revalidatePath('/calendario')

  return { success: true, data: agendamento }
}

export async function atualizarAgendamento(id: string, data: AgendamentoUpdate) {
  const supabase = await createClient()

  const { data: agendamento, error } = await supabase
    .from('agendamentos')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/visao-geral')
  revalidatePath('/hoje')
  revalidatePath('/agendamentos')
  revalidatePath('/calendario')

  return { success: true, data: agendamento }
}

export async function cancelarAgendamento(id: string) {
  return atualizarAgendamento(id, { status: 'cancelado' })
}

export async function concluirAgendamento(id: string) {
  return atualizarAgendamento(id, { status: 'concluido' })
}

export async function confirmarAgendamento(id: string) {
  return atualizarAgendamento(id, { status: 'confirmado' })
}

export async function buscarSlotsDisponiveis(
  data: string,
  servicoId: string,
  agendamentoIdExcluir?: string
) {
  const supabase = await createClient()

  // Fetch all needed data in parallel
  const [servicoRes, horariosRes, bloqueiosRes, agendamentosRes, configRes] = await Promise.all([
    supabase.from('servicos').select('duracao_minutos').eq('id', servicoId).single(),
    supabase.from('horarios_trabalho').select('*').eq('ativo', true),
    supabase.from('bloqueios').select('data_inicio, data_fim'),
    supabase
      .from('agendamentos')
      .select('data_hora, servico_id, servicos(duracao_minutos)')
      .gte('data_hora', `${data}T00:00:00`)
      .lt('data_hora', `${data}T23:59:59`)
      .not('status', 'in', '(cancelado,faltou)')
      .neq('id', agendamentoIdExcluir ?? '00000000-0000-0000-0000-000000000000'),
    supabase
      .from('configuracoes')
      .select('chave, valor')
      .in('chave', ['intervalo_agendamento', 'antecedencia_minima']),
  ])

  if (servicoRes.error || !servicoRes.data) {
    return { success: false, error: 'Serviço não encontrado', slots: [] }
  }

  const configs = Object.fromEntries(
    (configRes.data ?? []).map(c => [c.chave, parseInt(c.valor, 10)])
  )

  const diaSemana = new Date(data + 'T12:00:00').getDay()
  const horarioDoDia = (horariosRes.data ?? []).find(h => h.dia_semana === diaSemana)

  // Dynamic import to use shared slot logic
  const { calcularSlots } = await import('@/lib/slots')

  const agendamentosExistentes = (agendamentosRes.data ?? []).map(a => ({
    data_hora: a.data_hora,
    // @ts-expect-error - joined relation
    duracao_minutos: (a.servicos as { duracao_minutos: number })?.duracao_minutos ?? 30,
  }))

  const slots = calcularSlots({
    data,
    duracaoMinutos: servicoRes.data.duracao_minutos,
    horario: horarioDoDia
      ? { hora_inicio: horarioDoDia.hora_inicio, hora_fim: horarioDoDia.hora_fim }
      : null,
    bloqueios: bloqueiosRes.data ?? [],
    agendamentosExistentes,
    intervaloMinutos: configs.intervalo_agendamento ?? 30,
    antecedenciaMinima: configs.antecedencia_minima ?? 60,
  })

  return { success: true, slots }
}
