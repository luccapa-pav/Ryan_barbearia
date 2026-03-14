import { createClient } from '@/lib/supabase/server'
import { ShieldCheck, UserCheck, UserX, Clock } from 'lucide-react'
import { AdminActions, ReativarAction } from './admin-actions'

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

function getInitials(nome: string) {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

function Avatar({ nome, color }: { nome: string; color: string }) {
  return (
    <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${color}`}>
      {getInitials(nome)}
    </div>
  )
}

function StatusBadge({ role }: { role: string }) {
  if (role !== 'admin') return null
  return (
    <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-[10px] font-bold uppercase tracking-wide border border-amber-500/20">
      Admin
    </span>
  )
}

function UserCard({
  perfil,
  avatarColor,
  actions,
}: {
  perfil: Perfil
  avatarColor: string
  actions?: React.ReactNode
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-card border border-border/60 shadow-sm hover:border-border transition-colors">
      <Avatar nome={perfil.nome} color={avatarColor} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-semibold text-foreground text-sm">{perfil.nome}</p>
          <StatusBadge role={perfil.role} />
        </div>
        <p className="text-xs text-muted-foreground truncate mt-0.5">{perfil.email}</p>
        <p className="text-[10px] text-muted-foreground/50 mt-1">
          Desde {formatDate(perfil.criado_em)}
        </p>
      </div>
      {actions && (
        <div className="flex items-center gap-2 shrink-0">{actions}</div>
      )}
    </div>
  )
}

export default async function AdminPage() {
  const supabase = await createClient()
  const { data: perfis } = await supabase
    .from('perfis')
    .select('*')
    .order('criado_em', { ascending: false })

  const todos     = perfis ?? []
  const pendentes = todos.filter((p: Perfil) => p.status === 'pendente')
  const ativos    = todos.filter((p: Perfil) => p.status === 'ativo')
  const recusados = todos.filter((p: Perfil) => p.status === 'recusado')

  return (
    <div className="space-y-6 max-w-3xl mx-auto">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-foreground">Painel de Aprovações</h1>
          <p className="text-xs text-muted-foreground">Gerencie o acesso dos usuários ao sistema</p>
        </div>
      </div>

      {/* Pendentes — só aparece se houver */}
      {pendentes.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <Clock className="h-4 w-4 text-amber-500" />
            <h2 className="font-semibold text-foreground text-sm">Aguardando aprovação</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold border border-amber-500/20">
              {pendentes.length}
            </span>
          </div>
          <div className="space-y-2">
            {pendentes.map((p: Perfil) => (
              <UserCard
                key={p.id}
                perfil={p}
                avatarColor="bg-amber-500"
                actions={<AdminActions userId={p.user_id} nome={p.nome} />}
              />
            ))}
          </div>
        </section>
      )}

      {/* Ativos */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <UserCheck className="h-4 w-4 text-green-500" />
          <h2 className="font-semibold text-foreground text-sm">Usuários ativos</h2>
          <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 text-xs font-bold border border-green-500/20">
            {ativos.length}
          </span>
        </div>

        {ativos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 rounded-xl border border-dashed border-border/60 text-center gap-2">
            <UserCheck className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">Nenhum usuário ativo</p>
          </div>
        ) : (
          <div className="space-y-2">
            {ativos.map((p: Perfil) => (
              <UserCard
                key={p.id}
                perfil={p}
                avatarColor={p.role === 'admin' ? 'bg-amber-500' : 'bg-primary'}
              />
            ))}
          </div>
        )}
      </section>

      {/* Recusados */}
      {recusados.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <UserX className="h-4 w-4 text-red-500" />
            <h2 className="font-semibold text-foreground text-sm">Recusados</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-xs font-bold border border-red-500/20">
              {recusados.length}
            </span>
          </div>
          <div className="space-y-2">
            {recusados.map((p: Perfil) => (
              <UserCard
                key={p.id}
                perfil={p}
                avatarColor="bg-muted-foreground/40"
                actions={<ReativarAction userId={p.user_id} nome={p.nome} />}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
