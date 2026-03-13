'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { Plus, Search, Users, Phone, ChevronLeft, ChevronRight } from 'lucide-react'
import { formatarData, formatarTelefone } from '@/lib/utils'
import type { Cliente } from '@/lib/supabase/types'
import { HistoricoCliente } from '@/components/clientes/historico-cliente'

interface ClientesPageClientProps {
  clientes: Cliente[]
  total: number
  pagina: number
  pageSize: number
  busca: string
}

export function ClientesPageClient({ clientes, total, pagina, pageSize, busca }: ClientesPageClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null)
  const [searchValue, setSearchValue] = useState(busca)

  const totalPages = Math.ceil(total / pageSize)

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchValue) params.set('q', searchValue)
    router.push(`${pathname}?${params.toString()}`)
  }

  function goToPage(page: number) {
    const params = new URLSearchParams()
    if (busca) params.set('q', busca)
    params.set('pagina', String(page))
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Clientes</h2>
          <p className="text-muted-foreground text-sm mt-1">{total} cliente{total !== 1 ? 's' : ''} cadastrado{total !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="w-full pl-9 pr-3 py-2 rounded-md bg-card border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-amber-500/50"
          />
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground text-sm rounded-md transition-colors"
        >
          Buscar
        </button>
      </form>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client list */}
        <div className="lg:col-span-2">
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            {clientes.length === 0 ? (
              <div className="p-12 flex flex-col items-center text-center space-y-3">
                <Users className="w-10 h-10 text-muted-foreground" />
                <p className="text-foreground font-medium">Nenhum cliente encontrado</p>
                <p className="text-sm text-muted-foreground">
                  {busca ? 'Tente outra busca.' : 'Os clientes cadastrados aparecerão aqui.'}
                </p>
              </div>
            ) : (
              <>
                <div className="divide-y divide-border">
                  {clientes.map((cliente) => (
                    <button
                      key={cliente.id}
                      onClick={() => setSelectedCliente(
                        selectedCliente?.id === cliente.id ? null : cliente
                      )}
                      className={`w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-secondary/30 transition-colors ${
                        selectedCliente?.id === cliente.id ? 'bg-amber-500/5 border-l-2 border-amber-500' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                        <span className="text-sm font-semibold text-foreground">
                          {cliente.nome.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-foreground text-sm">{cliente.nome}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3 text-muted-foreground" />
                          <p className="text-xs text-muted-foreground">{formatarTelefone(cliente.telefone)}</p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground flex-shrink-0">
                        desde {formatarData(cliente.criado_em)}
                      </p>
                    </button>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Página {pagina} de {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={() => goToPage(pagina - 1)}
                        disabled={pagina <= 1}
                        className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => goToPage(pagina + 1)}
                        disabled={pagina >= totalPages}
                        className="p-1.5 rounded border border-border text-muted-foreground hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Histórico */}
        <div>
          {selectedCliente ? (
            <HistoricoCliente cliente={selectedCliente} />
          ) : (
            <div className="bg-card border border-border rounded-xl p-8 flex flex-col items-center text-center space-y-2">
              <Users className="w-8 h-8 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Selecione um cliente para ver seu histórico
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
