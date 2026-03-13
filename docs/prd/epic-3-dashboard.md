# Epic 3 — Dashboard MVP

## Objetivo
Dashboard web completo para Ryan gerenciar a barbearia: ver agendamentos do dia em tempo real, gerenciar agendamentos, clientes, configurações e visualizar calendário.

## Stories

### Story 3.1 — Hoje — Timeline + Stats + Realtime
**Agente:** @dev
**Status:** Done
**Arquivo:** `docs/stories/3.1.story.md`

Página `/hoje` com timeline do dia, stat cards (total de agendamentos, receita prevista, slots livres) e atualização em tempo real via Supabase Realtime quando novos agendamentos chegam pelo WhatsApp.

### Story 3.2 — Agendamentos — List + CRUD completo
**Agente:** @dev
**Status:** Done
**Arquivo:** `docs/stories/3.2.story.md`

Página `/agendamentos` com tabela paginada, filtros por status/data/serviço, e Sheet para criar/editar/cancelar agendamentos.

### Story 3.3 — Clientes — List + histórico
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/3.3.story.md`

Página `/clientes` com lista pesquisável e histórico de agendamentos por cliente.

### Story 3.4 — Configurações — Horários, serviços, bloqueios
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/3.4.story.md`

Página `/configuracoes` para gerenciar horários de trabalho por dia da semana, serviços oferecidos, bloqueios de data (feriados/férias) e configurações gerais.

### Story 3.5 — Calendário — Semana/mês
**Agente:** @dev
**Status:** Todo
**Arquivo:** `docs/stories/3.5.story.md`

Página `/calendario` com visão de semana e mês mostrando blocos de agendamento com cor por status.

## Critérios de Conclusão do Epic

- [ ] Ryan abre `/hoje` e vê agendamentos do dia com timeline visual
- [ ] Novo agendamento via WhatsApp aparece no `/hoje` sem reload (Realtime)
- [ ] Ryan cria agendamento manual no dashboard → aparece no `/hoje`
- [ ] Ryan consegue editar e cancelar agendamentos
- [ ] Busca de clientes funciona
- [ ] Ryan bloqueia data em Configurações → slots desse dia não aparecem no WhatsApp
- [ ] Calendário mostra visão de semana e mês
- [ ] Login/logout funcional
- [ ] Dashboard responsivo e com dark theme amber
