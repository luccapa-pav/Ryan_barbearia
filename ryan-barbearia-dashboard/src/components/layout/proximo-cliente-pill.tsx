import { createClient } from '@/lib/supabase/server'
import { formatarHora } from '@/lib/utils'
import { Clock } from 'lucide-react'

export async function ProximoClientePill() {
  const supabase = await createClient()

  const result = await supabase
    .from('agendamentos')
    .select('data_hora, clientes(nome), servicos(nome)')
    .in('status', ['pendente', 'confirmado'])
    .gt('data_hora', new Date().toISOString())
    .order('data_hora', { ascending: true })
    .limit(1)
    .maybeSingle()

  const proximo = result.data as {
    data_hora: string
    clientes: { nome: string } | null
    servicos: { nome: string } | null
  } | null

  if (!proximo) return null

  return (
    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary/8 border border-primary/20 text-xs">
      <Clock className="w-3 h-3 text-primary shrink-0" />
      <span className="font-bold text-primary tabular-nums">{formatarHora(proximo.data_hora)}</span>
      <span className="text-foreground/70 font-medium truncate max-w-[120px]">{proximo.clientes?.nome}</span>
      <span className="text-muted-foreground truncate max-w-[90px] hidden lg:inline">{proximo.servicos?.nome}</span>
    </div>
  )
}
