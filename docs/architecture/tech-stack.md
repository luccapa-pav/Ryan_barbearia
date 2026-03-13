# Tech Stack — Ryan Barbearia

## Overview

Sistema completo para barbearia autônoma com agente IA no WhatsApp e dashboard web de gerenciamento.

## Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Frontend | Next.js (App Router) | 14.x |
| Linguagem | TypeScript | 5.x |
| Estilização | Tailwind CSS | 3.x |
| Componentes | shadcn/ui | latest |
| Backend/DB | Supabase | latest |
| Auth | Supabase Auth | latest |
| Realtime | Supabase Realtime | latest |
| Automação | n8n (EasyPanel) | latest |
| WhatsApp (dev) | Evolution API | latest |
| WhatsApp (prod) | Uazapi | futuro |
| Deploy | Vercel | latest |

## Infraestrutura

- **Supabase Project:** `idoinzdgalacaanlcjog.supabase.co`
- **n8n Instance:** `n8n-n8n.yjlhot.easypanel.host`
- **Dashboard URL:** Vercel (a definir)

## Design System

| Token | Valor |
|-------|-------|
| Background | `hsl(240 10% 3.9%)` — zinc-950 |
| Card | `hsl(240 10% 7%)` |
| Accent | `hsl(38 92% 50%)` — amber |
| Raio borda | `0.5rem` |
| Fonte | Inter (Google Fonts) |

Inspiração visual: `dash-sombrear.vercel.app` (dark theme profissional)

## Decisões Arquiteturais

1. **App Router (Next.js 14)** — Server Components por padrão, Client Components apenas para interatividade
2. **Supabase Realtime** — Página `/hoje` atualiza automaticamente sem polling
3. **Server Actions** — Mutations via Server Actions (sem API routes extras)
4. **RLS Supabase** — Segurança em nível de banco, não só na aplicação
5. **`lib/slots.ts` compartilhado** — Lógica de slots disponíveis usada pelo dashboard E pelo n8n (via Edge Function ou chamada direta)
6. **WhatsApp isolado** — Apenas o nó adaptador muda na migração Evolution API → Uazapi
