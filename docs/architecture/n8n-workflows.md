# n8n Workflows — Ryan Barbearia

## Instância
`n8n-n8n.yjlhot.easypanel.host`

## Credenciais n8n necessárias
- `SUPABASE_URL` — URL do projeto Supabase
- `SUPABASE_SERVICE_KEY` — Service role key (bypassa RLS)
- `OPENAI_API_KEY` — Para AI Classifier (GPT-4o-mini)
- `EVOLUTION_API_URL` — URL da Evolution API
- `EVOLUTION_API_KEY` — Chave da Evolution API
- `EVOLUTION_INSTANCE` — Nome da instância WhatsApp

---

## Workflow 1: `whatsapp-receiver`

Entry point para todas as mensagens do WhatsApp.

```
Webhook POST /webhook/evolution
  → Normalizar mensagem (extrair telefone, texto, messageId)
  → Deduplicação: verificar messageId no cache (Redis/KV ou Set em memória)
  → AI Classifier (GPT-4o-mini):
      system: "Classifique a intenção em: agendar|cancelar|consultar|saudacao|outro"
      user: {texto}
  → Switch por intent:
      agendar    → Execute Workflow: agendamento-flow
      cancelar   → Execute Workflow: cancelamento-flow
      consultar  → Responder com próximos agendamentos do cliente
      saudacao   → Responder com mensagem de boas-vindas + opções
      outro      → Responder "Não entendi. Digite: agendar, cancelar ou consultar"
```

**Nota de migração:** Apenas o nó de normalização muda ao trocar Evolution API → Uazapi.
O payload muda, mas o output normalizado (`{telefone, texto, messageId, nome}`) é idêntico.

---

## Workflow 2: `agendamento-flow`

Conversa multi-turn para agendamento.

```
Receber {telefone, texto, cliente_nome}
  → Carregar/criar sessão em sessoes_whatsapp
  → Switch por estado da sessão:

  [INICIO]
    → Check cliente existe? (SELECT por telefone)
    → Se não: pedir nome → estado=AGUARDANDO_NOME
    → Se sim: ir para ESCOLHER_SERVICO

  [AGUARDANDO_NOME]
    → Salvar nome → INSERT clientes → estado=ESCOLHER_SERVICO

  [ESCOLHER_SERVICO]
    → SELECT servicos WHERE ativo=true
    → Enviar lista numerada
    → estado=AGUARDANDO_SERVICO

  [AGUARDANDO_SERVICO]
    → Validar escolha → Salvar servico_id na sessão
    → estado=ESCOLHER_DATA

  [ESCOLHER_DATA]
    → Calcular próximos 7 dias com slots disponíveis
    → Enviar datas disponíveis numeradas
    → estado=AGUARDANDO_DATA

  [AGUARDANDO_DATA]
    → Salvar data na sessão
    → Calcular slots do dia (horarios_trabalho - bloqueios - agendamentos)
    → Enviar slots numerados
    → estado=AGUARDANDO_HORA

  [AGUARDANDO_HORA]
    → Validar slot → Mostrar resumo do agendamento
    → "Confirmar? (sim/não)"
    → estado=AGUARDANDO_CONFIRMACAO

  [AGUARDANDO_CONFIRMACAO]
    → sim: INSERT agendamentos (status=confirmado, origem=whatsapp) → Limpar sessão → Confirmar
    → não: "Agendamento cancelado. Digite 'agendar' para recomeçar." → Limpar sessão
```

**Cálculo de slots disponíveis:**
```javascript
// Para cada slot no intervalo hora_inicio até hora_fim (de intervalo_agendamento em minutos):
// 1. Verificar se está dentro dos horarios_trabalho do dia_semana
// 2. Verificar se não está em período de bloqueio
// 3. Verificar se não há agendamento existente no mesmo slot (considerando duração do serviço)
// 4. Verificar antecedencia_minima (não mostrar slots < X minutos no futuro)
```

---

## Workflow 3: `lembrete-flow`

Dois crons independentes.

### Cron 1: Lembrete dia anterior (20:00 diário)
```
Cron: 0 20 * * *
  → SELECT agendamentos WHERE
      data_hora::date = CURRENT_DATE + 1
      AND status IN ('pendente','confirmado')
      AND lembrete_dia = false
  → Para cada agendamento:
      → SELECT cliente nome/telefone, servico nome
      → Enviar WhatsApp: "Olá {nome}! Lembrete: seu agendamento amanhã às {hora} ({servico}). Responda CONFIRMAR ou CANCELAR"
      → UPDATE agendamentos SET lembrete_dia = true WHERE id = {id}
```

### Cron 2: Lembrete 1 hora antes (*/30min)
```
Cron: */30 * * * *
  → SELECT agendamentos WHERE
      data_hora BETWEEN NOW() + INTERVAL '55 minutes' AND NOW() + INTERVAL '65 minutes'
      AND status IN ('pendente','confirmado')
      AND lembrete_hora = false
  → Para cada agendamento:
      → Enviar WhatsApp: "Olá {nome}! Seu agendamento é em 1 hora ({hora}). Te esperamos!"
      → UPDATE agendamentos SET lembrete_hora = true WHERE id = {id}
```

---

## Workflow 4: `cancelamento-flow`

```
Receber {telefone, texto}
  → SELECT agendamentos WHERE
      cliente_id = (SELECT id FROM clientes WHERE telefone = {telefone})
      AND status IN ('pendente','confirmado')
      AND data_hora > NOW()
    ORDER BY data_hora ASC
    LIMIT 3
  → Se nenhum: "Você não tem agendamentos ativos."
  → Se um: Mostrar e confirmar cancelamento
  → Se múltiplos: Listar e pedir escolha
  → Confirmação: "Tem certeza que quer cancelar {serviço} em {data}? (sim/não)"
  → sim: UPDATE agendamentos SET status='cancelado' → "Agendamento cancelado com sucesso."
  → não: "Ok, seu agendamento foi mantido."
```

---

## Variáveis de Ambiente n8n

```
SUPABASE_URL=https://idoinzdgalacaanlcjog.supabase.co
SUPABASE_SERVICE_KEY=<service_role_key>
OPENAI_API_KEY=<openai_key>
EVOLUTION_API_URL=<evolution_url>
EVOLUTION_API_KEY=<evolution_key>
EVOLUTION_INSTANCE=<instance_name>
```
