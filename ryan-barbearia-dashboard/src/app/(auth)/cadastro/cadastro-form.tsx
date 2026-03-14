'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { cadastrarPerfil } from '@/actions/auth'
import { toast } from 'sonner'

export function CadastroForm() {
  const router = useRouter()
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (senha !== confirmar) {
      toast.error('As senhas não coincidem.')
      return
    }

    if (senha.length < 6) {
      toast.error('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signUp({
        email,
        password: senha,
        options: { data: { nome } },
      })

      if (error) {
        toast.error(error.message)
        return
      }

      await cadastrarPerfil({ nome, email })
      router.push('/aguardando')
    } catch {
      toast.error('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass =
    'w-full px-3 py-2 rounded-md bg-card border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-colors'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="nome" className="text-sm font-medium text-foreground">Nome</label>
        <input
          id="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Seu nome completo"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="email" className="text-sm font-medium text-foreground">E-mail</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="senha" className="text-sm font-medium text-foreground">Senha</label>
        <input
          id="senha"
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          placeholder="••••••••"
          required
          className={inputClass}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="confirmar" className="text-sm font-medium text-foreground">Confirmar senha</label>
        <input
          id="confirmar"
          type="password"
          value={confirmar}
          onChange={(e) => setConfirmar(e.target.value)}
          placeholder="••••••••"
          required
          className={inputClass}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Criando conta...' : 'Criar conta'}
      </button>
    </form>
  )
}
