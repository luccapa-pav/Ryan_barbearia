-- ============================================================
-- Ryan Barbearia — Migration 001: Initial Schema
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- TRIGGER FUNCTION: handle_updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.atualizado_em = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TABLE: clientes
-- ============================================================
CREATE TABLE clientes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome         TEXT NOT NULL,
  telefone     TEXT NOT NULL UNIQUE,
  observacoes  TEXT,
  criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on clientes"
  ON clientes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: servicos
-- ============================================================
CREATE TABLE servicos (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome              TEXT NOT NULL,
  duracao_minutos   INT NOT NULL CHECK (duracao_minutos > 0),
  preco             NUMERIC(10, 2) NOT NULL CHECK (preco >= 0),
  ativo             BOOLEAN NOT NULL DEFAULT true
);

ALTER TABLE servicos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on servicos"
  ON servicos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: horarios_trabalho
-- ============================================================
CREATE TABLE horarios_trabalho (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dia_semana   INT NOT NULL CHECK (dia_semana BETWEEN 0 AND 6),
  hora_inicio  TIME NOT NULL,
  hora_fim     TIME NOT NULL,
  ativo        BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (dia_semana)
);

ALTER TABLE horarios_trabalho ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on horarios_trabalho"
  ON horarios_trabalho FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: bloqueios
-- ============================================================
CREATE TABLE bloqueios (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  data_inicio  TIMESTAMPTZ NOT NULL,
  data_fim     TIMESTAMPTZ NOT NULL,
  motivo       TEXT,
  CHECK (data_fim > data_inicio)
);

ALTER TABLE bloqueios ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on bloqueios"
  ON bloqueios FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: agendamentos
-- ============================================================
CREATE TABLE agendamentos (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id    UUID NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
  servico_id    UUID NOT NULL REFERENCES servicos(id) ON DELETE RESTRICT,
  data_hora     TIMESTAMPTZ NOT NULL,
  status        TEXT NOT NULL DEFAULT 'pendente'
                CHECK (status IN ('pendente', 'confirmado', 'cancelado', 'concluido', 'faltou')),
  observacoes   TEXT,
  origem        TEXT NOT NULL DEFAULT 'dashboard'
                CHECK (origem IN ('whatsapp', 'dashboard', 'manual')),
  lembrete_dia  BOOLEAN NOT NULL DEFAULT false,
  lembrete_hora BOOLEAN NOT NULL DEFAULT false,
  criado_em     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_agendamentos_data_hora ON agendamentos (data_hora);
CREATE INDEX idx_agendamentos_cliente_id ON agendamentos (cliente_id);
CREATE INDEX idx_agendamentos_status ON agendamentos (status);

CREATE TRIGGER agendamentos_updated_at
  BEFORE UPDATE ON agendamentos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

ALTER TABLE agendamentos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on agendamentos"
  ON agendamentos FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Allow service role (n8n) to insert/update agendamentos
CREATE POLICY "Service role can do everything on agendamentos"
  ON agendamentos FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- TABLE: configuracoes
-- ============================================================
CREATE TABLE configuracoes (
  chave     TEXT PRIMARY KEY,
  valor     TEXT NOT NULL,
  descricao TEXT
);

ALTER TABLE configuracoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can do everything on configuracoes"
  ON configuracoes FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- SEEDS: servicos
-- ============================================================
INSERT INTO servicos (nome, duracao_minutos, preco, ativo) VALUES
  ('Corte Simples',    30, 35.00, true),
  ('Corte + Barba',    60, 60.00, true),
  ('Barba',            30, 30.00, true),
  ('Pigmentação',      60, 80.00, true);

-- ============================================================
-- SEEDS: horarios_trabalho (Seg=1 a Sex=5, Sab=6)
-- ============================================================
INSERT INTO horarios_trabalho (dia_semana, hora_inicio, hora_fim, ativo) VALUES
  (1, '09:00', '19:00', true),  -- Segunda
  (2, '09:00', '19:00', true),  -- Terça
  (3, '09:00', '19:00', true),  -- Quarta
  (4, '09:00', '19:00', true),  -- Quinta
  (5, '09:00', '19:00', true),  -- Sexta
  (6, '09:00', '17:00', true);  -- Sábado

-- ============================================================
-- SEEDS: configuracoes
-- ============================================================
INSERT INTO configuracoes (chave, valor, descricao) VALUES
  ('barbeiro_nome',          'Ryan',                                                              'Nome do barbeiro exibido nas mensagens'),
  ('barbeiro_telefone',      '',                                                                  'Telefone do barbeiro (para contato direto)'),
  ('intervalo_agendamento',  '30',                                                                'Intervalo entre slots em minutos'),
  ('antecedencia_minima',    '60',                                                                'Antecedência mínima para agendamento (minutos)'),
  ('antecedencia_maxima',    '30',                                                                'Antecedência máxima para agendamento (dias)'),
  ('lembrete_dia_hora',      '20:00',                                                             'Horário de envio do lembrete do dia anterior'),
  ('mensagem_boas_vindas',   'Olá! Sou o assistente da barbearia do Ryan. Como posso te ajudar?', 'Mensagem inicial do WhatsApp');
