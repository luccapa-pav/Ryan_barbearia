import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let isAdmin = false
  if (user) {
    const { data: perfil } = await supabase
      .from('perfis')
      .select('role')
      .eq('user_id', user.id)
      .single()
    isAdmin = perfil?.role === 'admin'
  }

  return <DashboardShell isAdmin={isAdmin}>{children}</DashboardShell>
}
