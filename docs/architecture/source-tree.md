# Source Tree — Ryan Barbearia Dashboard

## Estrutura Completa

```
ryan-barbearia-dashboard/
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
├── .env.local                    ← gitignored
├── .env.local.example
├── components.json               ← shadcn/ui config
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── middleware.ts              ← Supabase Auth middleware (route protection)
│   │
│   ├── app/
│   │   ├── layout.tsx             ← Root layout (fonts, theme provider)
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx       ← Login com Supabase Auth UI
│   │   │
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx         ← Sidebar + header compartilhados
│   │   │   ├── hoje/
│   │   │   │   └── page.tsx       ← Timeline do dia + stats + realtime
│   │   │   ├── agendamentos/
│   │   │   │   └── page.tsx       ← Tabela paginada + filtros + CRUD
│   │   │   ├── clientes/
│   │   │   │   └── page.tsx       ← Lista + busca + histórico
│   │   │   ├── configuracoes/
│   │   │   │   └── page.tsx       ← Horários, serviços, bloqueios, settings
│   │   │   └── calendario/
│   │   │       └── page.tsx       ← Visão semana/mês
│   │   │
│   │   └── api/
│   │       └── webhooks/
│   │           └── evolution/
│   │               └── route.ts   ← Webhook receiver (proxy para n8n ou handler)
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── sidebar.tsx        ← Nav lateral (links + ativo state)
│   │   │   ├── header.tsx         ← Breadcrumb + user menu
│   │   │   └── theme-provider.tsx
│   │   │
│   │   ├── hoje/
│   │   │   ├── timeline.tsx       ← Lista de agendamentos do dia ordenados
│   │   │   ├── stat-cards.tsx     ← Total, receita, slots livres
│   │   │   └── agendamento-card.tsx ← Card individual na timeline
│   │   │
│   │   ├── agendamentos/
│   │   │   ├── agendamentos-table.tsx  ← DataTable com filtros
│   │   │   ├── agendamento-sheet.tsx   ← Sheet create/edit
│   │   │   ├── filtros.tsx
│   │   │   └── status-badge.tsx
│   │   │
│   │   ├── clientes/
│   │   │   ├── clientes-table.tsx
│   │   │   ├── cliente-sheet.tsx
│   │   │   └── historico-cliente.tsx
│   │   │
│   │   ├── calendario/
│   │   │   ├── calendario-view.tsx     ← Semana/mês toggle
│   │   │   ├── semana-view.tsx
│   │   │   └── mes-view.tsx
│   │   │
│   │   ├── configuracoes/
│   │   │   ├── horarios-form.tsx
│   │   │   ├── servicos-form.tsx
│   │   │   ├── bloqueios-form.tsx
│   │   │   └── settings-form.tsx
│   │   │
│   │   └── ui/                    ← shadcn/ui components (gerados pelo CLI)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── sheet.tsx
│   │       ├── table.tsx
│   │       ├── badge.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── calendar.tsx
│   │       ├── popover.tsx
│   │       └── ...
│   │
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts          ← createBrowserClient()
│   │   │   ├── server.ts          ← createServerClient() + cookies
│   │   │   └── types.ts           ← Database types (gerado por supabase gen types)
│   │   ├── slots.ts               ← Cálculo de slots disponíveis (compartilhado)
│   │   └── utils.ts               ← cn(), formatters, helpers
│   │
│   ├── hooks/
│   │   ├── use-agendamentos.ts        ← Lista paginada com filtros
│   │   ├── use-agendamentos-hoje.ts   ← Hoje + Realtime subscription
│   │   ├── use-clientes.ts
│   │   └── use-servicos.ts
│   │
│   └── actions/
│       ├── agendamentos.ts        ← Server Actions: create, update, cancel
│       ├── clientes.ts            ← Server Actions: create, update
│       ├── configuracoes.ts       ← Server Actions: save settings
│       └── servicos.ts            ← Server Actions: create, update, toggle
│
└── supabase/
    └── migrations/
        ├── 001_initial_schema.sql
        └── 002_sessions.sql
```

## Convenções

- **Server Components** por padrão em `app/`
- **'use client'** apenas em componentes com estado, eventos ou hooks
- **Server Actions** em `actions/` com `'use server'`
- **Hooks** são sempre Client-side (`'use client'`)
- **Imports absolutos** via `@/` (configurado no tsconfig)
