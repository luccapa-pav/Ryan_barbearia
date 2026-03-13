-- ============================================================
-- Ryan Barbearia — Migration 002: WhatsApp Sessions
-- ============================================================

-- ============================================================
-- TABLE: sessoes_whatsapp
-- Gerencia estado das conversas multi-turn do agente WhatsApp
-- TTL: 30 minutos por padrão
-- ============================================================
CREATE TABLE sessoes_whatsapp (
  telefone      TEXT PRIMARY KEY,
  workflow      TEXT NOT NULL,
  estado        TEXT NOT NULL,
  dados         JSONB NOT NULL DEFAULT '{}',
  expirado_em   TIMESTAMPTZ NOT NULL,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index para limpeza de sessões expiradas
CREATE INDEX idx_sessoes_whatsapp_expirado_em ON sessoes_whatsapp (expirado_em);

ALTER TABLE sessoes_whatsapp ENABLE ROW LEVEL SECURITY;

-- Apenas service role (n8n) acessa sessões
CREATE POLICY "Service role can do everything on sessoes_whatsapp"
  ON sessoes_whatsapp FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================
-- FUNCTION: limpar_sessoes_expiradas
-- Chamada pelo n8n periodicamente para limpar sessões antigas
-- ============================================================
CREATE OR REPLACE FUNCTION limpar_sessoes_expiradas()
RETURNS INT AS $$
DECLARE
  deleted_count INT;
BEGIN
  DELETE FROM sessoes_whatsapp WHERE expirado_em < NOW();
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- Allow service role to access clientes and servicos
-- (needed by n8n workflows)
-- ============================================================
CREATE POLICY "Service role can do everything on clientes"
  ON clientes FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Service role can read servicos"
  ON servicos FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can read horarios_trabalho"
  ON horarios_trabalho FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can read bloqueios"
  ON bloqueios FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can read configuracoes"
  ON configuracoes FOR SELECT
  TO service_role
  USING (true);
