import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  let pendentesCount = 0

  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('role')
      .eq('user_id', user.id)
      .single()
    isAdmin = perfil?.role === 'admin'

    if (isAdmin) {
      const { count } = await supabase
        .from('perfis')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente')
      pendentesCount = count ?? 0
    }
  }

  return (
    <DashboardShell isAdmin={isAdmin} pendentesCount={pendentesCount}>
      {children}
    </DashboardShell>
  )
}
