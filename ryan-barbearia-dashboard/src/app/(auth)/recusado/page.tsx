import { logout } from '@/actions/auth'

export default function RecusadoPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20">
          <span className="text-3xl">🚫</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Cadastro recusado</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sua solicitação de acesso foi recusada pelo administrador.
            Entre em contato com o responsável para mais informações.
          </p>
        </div>

        <form action={logout}>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-md bg-muted hover:bg-muted/80 text-foreground font-semibold transition-colors text-sm"
          >
            Sair
          </button>
        </form>
      </div>
    </div>
  )
}
