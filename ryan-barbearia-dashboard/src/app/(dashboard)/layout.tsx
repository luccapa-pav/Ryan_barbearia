import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Lê dados do perfil passados pelo middleware — evita queries duplicadas
  const headersList = await headers()
  const role = headersList.get('x-user-role') ?? ''
  const isAdmin = role === 'admin'

  let pendentesCount = 0

  if (isAdmin) {
    const supabase = await createClient()
    const { count } = await supabase
      .from('perfis')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pendente')
    pendentesCount = count ?? 0
  }

  return (
    <DashboardShell isAdmin={isAdmin} pendentesCount={pendentesCount}>
      {children}
    </DashboardShell>
  )
}
