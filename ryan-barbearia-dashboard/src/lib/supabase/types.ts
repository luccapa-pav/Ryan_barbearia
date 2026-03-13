// Auto-generated types for Ryan Barbearia Supabase schema
// Regenerate with: npx supabase gen types typescript --project-id idoinzdgalacaanlcjog > src/lib/supabase/types.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AgendamentoStatus = 'pendente' | 'confirmado' | 'cancelado' | 'concluido' | 'faltou'
export type AgendamentoOrigem = 'whatsapp' | 'dashboard' | 'manual'

export interface Database {
  public: {
    Tables: {
      clientes: {
        Row: {
          id: string
          nome: string
          telefone: string
          observacoes: string | null
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          nome: string
          telefone: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          nome?: string
          telefone?: string
          observacoes?: string | null
          criado_em?: string
          atualizado_em?: string
        }
      }
      servicos: {
        Row: {
          id: string
          nome: string
          duracao_minutos: number
          preco: number
          ativo: boolean
        }
        Insert: {
          id?: string
          nome: string
          duracao_minutos: number
          preco: number
          ativo?: boolean
        }
        Update: {
          id?: string
          nome?: string
          duracao_minutos?: number
          preco?: number
          ativo?: boolean
        }
      }
      horarios_trabalho: {
        Row: {
          id: string
          dia_semana: number
          hora_inicio: string
          hora_fim: string
          ativo: boolean
        }
        Insert: {
          id?: string
          dia_semana: number
          hora_inicio: string
          hora_fim: string
          ativo?: boolean
        }
        Update: {
          id?: string
          dia_semana?: number
          hora_inicio?: string
          hora_fim?: string
          ativo?: boolean
        }
      }
      bloqueios: {
        Row: {
          id: string
          data_inicio: string
          data_fim: string
          motivo: string | null
        }
        Insert: {
          id?: string
          data_inicio: string
          data_fim: string
          motivo?: string | null
        }
        Update: {
          id?: string
          data_inicio?: string
          data_fim?: string
          motivo?: string | null
        }
      }
      agendamentos: {
        Row: {
          id: string
          cliente_id: string
          servico_id: string
          data_hora: string
          status: AgendamentoStatus
          observacoes: string | null
          origem: AgendamentoOrigem
          lembrete_dia: boolean
          lembrete_hora: boolean
          criado_em: string
          atualizado_em: string
        }
        Insert: {
          id?: string
          cliente_id: string
          servico_id: string
          data_hora: string
          status?: AgendamentoStatus
          observacoes?: string | null
          origem?: AgendamentoOrigem
          lembrete_dia?: boolean
          lembrete_hora?: boolean
          criado_em?: string
          atualizado_em?: string
        }
        Update: {
          id?: string
          cliente_id?: string
          servico_id?: string
          data_hora?: string
          status?: AgendamentoStatus
          observacoes?: string | null
          origem?: AgendamentoOrigem
          lembrete_dia?: boolean
          lembrete_hora?: boolean
          criado_em?: string
          atualizado_em?: string
        }
      }
      configuracoes: {
        Row: {
          chave: string
          valor: string
          descricao: string | null
        }
        Insert: {
          chave: string
          valor: string
          descricao?: string | null
        }
        Update: {
          chave?: string
          valor?: string
          descricao?: string | null
        }
      }
      sessoes_whatsapp: {
        Row: {
          telefone: string
          workflow: string
          estado: string
          dados: Json
          expirado_em: string
          atualizado_em: string
        }
        Insert: {
          telefone: string
          workflow: string
          estado: string
          dados?: Json
          expirado_em: string
          atualizado_em?: string
        }
        Update: {
          telefone?: string
          workflow?: string
          estado?: string
          dados?: Json
          expirado_em?: string
          atualizado_em?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: {
      limpar_sessoes_expiradas: {
        Args: Record<string, never>
        Returns: number
      }
    }
    Enums: Record<string, never>
  }
}

// Convenience type aliases
export type Cliente = Database['public']['Tables']['clientes']['Row']
export type ClienteInsert = Database['public']['Tables']['clientes']['Insert']
export type ClienteUpdate = Database['public']['Tables']['clientes']['Update']

export type Servico = Database['public']['Tables']['servicos']['Row']
export type ServicoInsert = Database['public']['Tables']['servicos']['Insert']
export type ServicoUpdate = Database['public']['Tables']['servicos']['Update']

export type HorarioTrabalho = Database['public']['Tables']['horarios_trabalho']['Row']
export type HorarioTrabalhoInsert = Database['public']['Tables']['horarios_trabalho']['Insert']
export type HorarioTrabalhoUpdate = Database['public']['Tables']['horarios_trabalho']['Update']

export type Bloqueio = Database['public']['Tables']['bloqueios']['Row']
export type BloqueioInsert = Database['public']['Tables']['bloqueios']['Insert']
export type BloqueioUpdate = Database['public']['Tables']['bloqueios']['Update']

export type Agendamento = Database['public']['Tables']['agendamentos']['Row']
export type AgendamentoInsert = Database['public']['Tables']['agendamentos']['Insert']
export type AgendamentoUpdate = Database['public']['Tables']['agendamentos']['Update']

export type Configuracao = Database['public']['Tables']['configuracoes']['Row']

export type SessaoWhatsapp = Database['public']['Tables']['sessoes_whatsapp']['Row']

// Extended types with joins
export type AgendamentoComRelacoes = Agendamento & {
  clientes: Pick<Cliente, 'id' | 'nome' | 'telefone'>
  servicos: Pick<Servico, 'id' | 'nome' | 'duracao_minutos' | 'preco'>
}
