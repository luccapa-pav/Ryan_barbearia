# Database Schema — Ryan Barbearia

## Supabase Project
`idoinzdgalacaanlcjog.supabase.co`

## Tabelas

### `clientes`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| nome | text | NOT NULL |
| telefone | text | UNIQUE NOT NULL |
| observacoes | text | nullable |
| criado_em | timestamptz | DEFAULT now() |
| atualizado_em | timestamptz | DEFAULT now() |

### `servicos`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | gen_random_uuid() |
| nome | text | NOT NULL |
| duracao_minutos | int | NOT NULL |
| preco | numeric(10,2) | NOT NULL |
| ativo | boolean | DEFAULT true |

Seed: Corte Simples (30min, R$35), Corte + Barba (60min, R$60), Barba (30min, R$30), Pigmentação (60min, R$80)

### `horarios_trabalho`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| dia_semana | int | 0=Dom, 1=Seg, ..., 6=Sab. UNIQUE |
| hora_inicio | time | ex: '09:00' |
| hora_fim | time | ex: '19:00' |
| ativo | boolean | DEFAULT true |

Seed: Seg-Sex 09:00-19:00, Sab 09:00-17:00

### `bloqueios`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| data_inicio | timestamptz | NOT NULL |
| data_fim | timestamptz | NOT NULL |
| motivo | text | nullable |

Usado para feriados e férias.

### `agendamentos`
| Coluna | Tipo | Notas |
|--------|------|-------|
| id | uuid PK | |
| cliente_id | uuid FK → clientes | NOT NULL |
| servico_id | uuid FK → servicos | NOT NULL |
| data_hora | timestamptz | NOT NULL |
| status | text | pendente\|confirmado\|cancelado\|concluido\|faltou |
| observacoes | text | nullable |
| origem | text | whatsapp\|dashboard\|manual |
| lembrete_dia | boolean | DEFAULT false |
| lembrete_hora | boolean | DEFAULT false |
| criado_em | timestamptz | DEFAULT now() |
| atualizado_em | timestamptz | DEFAULT now() |

Indexes: (data_hora), (cliente_id), (status)

### `configuracoes`
| Coluna | Tipo | Notas |
|--------|------|-------|
| chave | text PK | |
| valor | text | NOT NULL |
| descricao | text | nullable |

Seeds padrão:
- `barbeiro_nome` = "Ryan"
- `barbeiro_telefone` = ""
- `intervalo_agendamento` = "30" (minutos entre slots)
- `antecedencia_minima` = "60" (minutos antes do horário)
- `antecedencia_maxima` = "30" (dias no futuro)
- `lembrete_dia_hora` = "20:00"
- `mensagem_boas_vindas` = "Olá! Sou o assistente da barbearia do Ryan. Como posso te ajudar?"

### `sessoes_whatsapp`
| Coluna | Tipo | Notas |
|--------|------|-------|
| telefone | text PK | |
| workflow | text | NOT NULL |
| estado | text | NOT NULL |
| dados | jsonb | DEFAULT '{}' |
| expirado_em | timestamptz | NOT NULL |
| atualizado_em | timestamptz | DEFAULT now() |

TTL: 30 minutos. Gerenciada pelo n8n para conversas multi-turn.

## RLS

Todas as tabelas têm RLS habilitado. Políticas:
- Usuário autenticado tem acesso total (barbeiro = único usuário)
- Service role bypassa RLS (usado pelo n8n)

## Triggers

`handle_updated_at()` — Atualiza `atualizado_em` automaticamente em `clientes` e `agendamentos`.
