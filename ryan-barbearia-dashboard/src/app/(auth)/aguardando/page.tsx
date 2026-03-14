import { logout } from '@/actions/auth'

export default function AguardandoPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20">
          <span className="text-3xl">⏳</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-foreground">Aguardando aprovação</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Sua conta foi criada e está aguardando aprovação do administrador.
            Você receberá acesso assim que sua solicitação for aprovada.
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
