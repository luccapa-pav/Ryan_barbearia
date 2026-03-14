import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { CadastroForm } from './cadastro-form'

export default async function CadastroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/visao-geral')
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 mb-4">
            <span className="text-3xl">✂️</span>
          </div>
          <h1 className="text-2xl font-bold text-foreground">Criar conta</h1>
          <p className="text-muted-foreground text-sm">Solicite acesso ao painel Ryan Barbearia</p>
        </div>

        <CadastroForm />

        <p className="text-center text-sm text-muted-foreground">
          Já tem conta?{' '}
          <a href="/login" className="text-amber-500 hover:text-amber-400 font-medium transition-colors">
            Fazer login
          </a>
        </p>
      </div>
    </div>
  )
}
