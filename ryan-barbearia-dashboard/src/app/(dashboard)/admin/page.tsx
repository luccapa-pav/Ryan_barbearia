import { createClient } from '@/lib/supabase/server'
import { aprovarUsuario, recusarUsuario } from '@/actions/auth'
import { ShieldCheck, UserCheck, UserX, Clock } from 'lucide-react'

type Perfil = {
  id: string
  user_id: string
  nome: string
  email: string
  role: string
  status: string
  criado_em: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function UserRow({ perfil, actions }: { perfil: Perfil; actions?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 px-4 rounded-lg bg-muted/40 border border-border/50">
      <div className="min-w-0">
        <p className="font-medium text-foreground text-sm truncate">{perfil.nome}</p>
        <p className="text-xs text-muted-foreground truncate">{perfil.email}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">{formatDate(perfil.criado_em)}</p>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: perfis } = await supabase
    .from('perfis')
    .select('*')
    .order('criado_em', { ascending: false })

  const pendentes = (perfis ?? []).filter((p: Perfil) => p.status === 'pendente')
  const ativos    = (perfis ?? []).filter((p: Perfil) => p.status === 'ativo')
  const recusados = (perfis ?? []).filter((p: Perfil) => p.status === 'recusado')

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-amber-500" />
        <div>
          <h1 className="text-xl font-bold text-foreground">Painel de Aprovações</h1>
          <p className="text-sm text-muted-foreground">Gerencie o acesso dos usuários ao sistema</p>
        </div>
      </div>

      {/* Pendentes */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500" />
          <h2 className="font-semibold text-foreground text-sm">
            Pendentes
            {pendentes.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold">
                {pendentes.length}
              </span>
            )}
          </h2>
        </div>

        {pendentes.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">Nenhum cadastro pendente.</p>
        ) : (
          <div className="space-y-2">
            {pendentes.map((p: Perfil) => (
              <UserRow
                key={p.id}
                perfil={p}
                actions={
                  <>
                    <form action={aprovarUsuario.bind(null, p.user_id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                      >
                        <UserCheck className="h-3.5 w-3.5" />
                        Aprovar
                      </button>
                    </form>
                    <form action={recusarUsuario.bind(null, p.user_id)}>
                      <button
                        type="submit"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-600 hover:bg-red-500 text-white text-xs font-semibold transition-colors"
                      >
                        <UserX className="h-3.5 w-3.5" />
                        Recusar
                      </button>
                    </form>
                  </>
                }
              />
            ))}
          </div>
        )}
      </section>

      {/* Ativos */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <UserCheck className="h-4 w-4 text-green-500" />
          <h2 className="font-semibold text-foreground text-sm">
            Ativos
            <span className="ml-2 px-2 py-0.5 rounded-full bg-green-500/15 text-green-600 text-xs font-bold">
              {ativos.length}
            </span>
          </h2>
        </div>

        {ativos.length === 0 ? (
          <p className="text-sm text-muted-foreground py-3 px-4">Nenhum usuário ativo.</p>
        ) : (
          <div className="space-y-2">
            {ativos.map((p: Perfil) => (
              <UserRow key={p.id} perfil={p} />
            ))}
          </div>
        )}
      </section>

      {/* Recusados */}
      {recusados.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <UserX className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-foreground text-sm">
              Recusados
              <span className="ml-2 px-2 py-0.5 rounded-full bg-red-500/15 text-red-600 text-xs font-bold">
                {recusados.length}
              </span>
            </h2>
          </div>
          <div className="space-y-2">
            {recusados.map((p: Perfil) => (
              <UserRow
                key={p.id}
                perfil={p}
                actions={
                  <form action={aprovarUsuario.bind(null, p.user_id)}>
                    <button
                      type="submit"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-500 text-white text-xs font-semibold transition-colors"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      Reativar
                    </button>
                  </form>
                }
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
