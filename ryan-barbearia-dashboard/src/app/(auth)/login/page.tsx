import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from './login-form'

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/hoje')
  }

  const { redirectTo } = await searchParams

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo/Brand */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <span className="text-3xl">✂️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Ryan Barbearia</h1>
          <p className="text-muted-foreground text-sm">Acesse o painel de gerenciamento</p>
        </div>

        <LoginForm redirectTo={redirectTo} />
      </div>
    </div>
  )
}
