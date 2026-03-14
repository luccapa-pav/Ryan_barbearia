import { createClient } from '@/lib/supabase/server'
import { ConfiguracoesPageClient } from './configuracoes-client'

export const revalidate = 30

export default async function ConfiguracoesPage() {
  const supabase = await createClient()

  const [servicosRes, horariosRes, bloqueiosRes, configRes] = await Promise.all([
    supabase.from('servicos').select('*').order('nome'),
    supabase.from('horarios_trabalho').select('*').order('dia_semana'),
    supabase.from('bloqueios').select('*').order('data_inicio'),
    supabase.from('configuracoes').select('*'),
  ])

  const configuracoes = Object.fromEntries(
    (configRes.data ?? []).map(c => [c.chave, c.valor])
  )

  return (
    <ConfiguracoesPageClient
      servicos={servicosRes.data ?? []}
      horarios={horariosRes.data ?? []}
      bloqueios={bloqueiosRes.data ?? []}
      configuracoes={configuracoes}
    />
  )
}
