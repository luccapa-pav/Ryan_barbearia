import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Lê dados do perfil passados pelo middleware — evita queries duplicadas
  const headersList = await headers()
  const role = headersList.get('x-user-role') ?? ''
  const isAdmin = role === 'admin'

  const supabase = await createClient()

  const [pendentesResult, proximoResult] = await Promise.all([
    isAdmin
      ? supabase.from('perfis').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
      : Promise.resolve({ count: 0 }),
    supabase
      .from('agendamentos')
      .select('data_hora, clientes(nome), servicos(nome)')
      .in('status', ['pendente', 'confirmado'])
      .gt('data_hora', new Date().toISOString())
      .order('data_hora', { ascending: true })
      .limit(1)
      .maybeSingle(),
  ])

  const pendentesCount = pendentesResult.count ?? 0
  const proximoCliente = proximoResult.data as {
    data_hora: string
    clientes: { nome: string } | null
    servicos: { nome: string } | null
  } | null

  return (
    <DashboardShell isAdmin={isAdmin} pendentesCount={pendentesCount} proximoCliente={proximoCliente}>
      {children}
    </DashboardShell>
  )
}
