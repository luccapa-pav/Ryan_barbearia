'use client'

import { usePathname, useRouter } from 'next/navigation'
import { LogOut, Bell } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

const PAGE_TITLES: Record<string, string> = {
  '/hoje': 'Hoje',
  '/agendamentos': 'Agendamentos',
  '/clientes': 'Clientes',
  '/configuracoes': 'Configurações',
  '/calendario': 'Calendário',
}

export function Header() {
  const pathname = usePathname()
  const router = useRouter()

  const title = PAGE_TITLES[pathname] ?? 'Dashboard'

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    toast.success('Até logo!')
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background/50 backdrop-blur-sm flex-shrink-0">
      <h1 className="text-lg font-semibold text-foreground">{title}</h1>

      <div className="flex items-center gap-2">
        <button
          className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Notificações"
        >
          <Bell className="w-4 h-4" />
        </button>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          aria-label="Sair"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sair</span>
        </button>
      </div>
    </header>
  )
}
