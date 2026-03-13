import { createClient } from '@/lib/supabase/server'
import { ClientesPageClient } from './clientes-client'

export const dynamic = 'force-dynamic'

interface ClientesPageProps {
  searchParams: Promise<{ q?: string; pagina?: string }>
}

export default async function ClientesPage({ searchParams }: ClientesPageProps) {
  const supabase = await createClient()
  const params = await searchParams

  const pagina = parseInt(params.pagina ?? '1', 10)
  const pageSize = 20
  const offset = (pagina - 1) * pageSize

  let query = supabase
    .from('clientes')
    .select('*', { count: 'exact' })
    .order('nome', { ascending: true })
    .range(offset, offset + pageSize - 1)

  if (params.q) {
    query = query.or(`nome.ilike.%${params.q}%,telefone.ilike.%${params.q}%`)
  }

  const { data: clientes, count } = await query

  return (
    <ClientesPageClient
      clientes={clientes ?? []}
      total={count ?? 0}
      pagina={pagina}
      pageSize={pageSize}
      busca={params.q ?? ''}
    />
  )
}
