import { Suspense } from 'react'
import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { ProximoClientePill } from '@/components/layout/proximo-cliente-pill'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Lê dados do perfil passados pelo middleware — evita queries duplicadas
  const headersList = await headers()
  const role = headersList.get('x-user-role') ?? ''
  const isAdmin = role === 'admin'

  const supabase = await createClient()

  // Apenas pendentesCount bloqueia o render — proximoCliente é streamado via Suspense
  const pendentesResult = isAdmin
    ? await supabase.from('perfis').select('id', { count: 'exact', head: true }).eq('status', 'pendente')
    : { count: 0 }

  const pendentesCount = pendentesResult.count ?? 0

  return (
    <DashboardShell
      isAdmin={isAdmin}
      pendentesCount={pendentesCount}
      proximoClienteSlot={
        <Suspense fallback={null}>
          <ProximoClientePill />
        </Suspense>
      }
    >
      {children}
    </DashboardShell>
  )
}
