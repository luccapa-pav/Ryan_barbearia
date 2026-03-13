# Epic 1 — Database & Backend

## Objetivo
Criar toda a infraestrutura de banco de dados no Supabase e o projeto Next.js base com autenticação e layout shell.

## Stories

### Story 1.1 — Schema + Migrations + Seed + RLS
**Agente:** @data-engineer
**Status:** Done
**Arquivo:** `docs/stories/1.1.story.md`

Criar todas as migrations SQL para as 7 tabelas, seeds iniciais, triggers, indexes e políticas RLS.

### Story 1.2 — Next.js Bootstrap + Auth + Layout Shell
**Agente:** @dev
**Status:** Done
**Arquivo:** `docs/stories/1.2.story.md`

Criar o projeto Next.js 14 com TypeScript, Tailwind, shadcn/ui, Supabase Auth, middleware de proteção de rotas e o layout shell do dashboard (sidebar + header).

## Critérios de Conclusão do Epic

- [ ] Todas as 7 tabelas criadas no Supabase com RLS habilitado
- [ ] Seeds executados (serviços, horários, configurações)
- [ ] Projeto Next.js rodando localmente (`npm run dev`)
- [ ] Login/logout funcionando com Supabase Auth
- [ ] Rotas protegidas pelo middleware
- [ ] Layout do dashboard visível após login
