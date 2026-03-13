# Epic 2 — WhatsApp Agent (n8n)

## Objetivo
Criar o agente de WhatsApp no n8n que permite clientes agendar, cancelar e consultar horários automaticamente via conversa.

## Stories

### Story 2.1 — `whatsapp-receiver` workflow + Evolution API
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/2.1.story.md`

Entry point para todas as mensagens. Webhook da Evolution API, normalização, deduplicação e classificação de intent via GPT-4o-mini.

### Story 2.2 — `agendamento-flow` + session state
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/2.2.story.md`

Fluxo multi-turn completo para agendamento: escolha de serviço, data, horário e confirmação. Estado da conversa em `sessoes_whatsapp`.

### Story 2.3 — `lembrete-flow` (dia + hora)
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/2.3.story.md`

Dois crons: lembrete no dia anterior (20:00) e lembrete 1 hora antes (cron a cada 30min).

### Story 2.4 — `cancelamento-flow`
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/2.4.story.md`

Fluxo para cancelamento de agendamento via WhatsApp com confirmação.

## Critérios de Conclusão do Epic

- [ ] Cliente envia "quero agendar" → recebe serviços → escolhe → recebe slots → confirma → agendamento criado no Supabase
- [ ] Agendamento aparece no dashboard em tempo real
- [ ] Cron 20:00 envia lembrete dia anterior
- [ ] Cron */30min envia lembrete 1h antes
- [ ] Cliente consegue cancelar agendamento via WhatsApp
- [ ] Migração Evolution API → Uazapi requer mudança mínima (apenas nó adaptador)

## Nota de Migração WhatsApp

A migração para Uazapi no futuro requer apenas alterar o nó de normalização em `whatsapp-receiver`. Todos os outros workflows permanecem intactos pois trabalham com o formato normalizado `{telefone, texto, messageId, nome}`.
