-- ==============================================================================
-- FATOS & FAKES - TABELA OFICIAL DE ELEITORES AUDITADOS (voters_registry)
-- Execute este script no SQL Editor do Supabase (https://supabase.com/dashboard/project/ebarklhztoerbfjvpnqb/sql/new)
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.voters_registry (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cpf_masked TEXT NOT NULL,
  cpf_hash TEXT NOT NULL UNIQUE,
  email TEXT,
  phone TEXT,
  state VARCHAR(2) NOT NULL DEFAULT 'SP',
  city TEXT NOT NULL DEFAULT '',
  has_voted BOOLEAN DEFAULT true,
  poll_id TEXT NOT NULL DEFAULT 'eleicao-presidencia-2026',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices de consulta ultra-rápidos
CREATE INDEX IF NOT EXISTS idx_voters_cpf_masked ON public.voters_registry(cpf_masked);
CREATE INDEX IF NOT EXISTS idx_voters_cpf_hash ON public.voters_registry(cpf_hash);
CREATE INDEX IF NOT EXISTS idx_voters_state ON public.voters_registry(state);
CREATE INDEX IF NOT EXISTS idx_voters_poll_id ON public.voters_registry(poll_id);

-- Ativar Row Level Security (RLS)
ALTER TABLE public.voters_registry ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança
DROP POLICY IF EXISTS "Permitir inserção anônima de eleitores" ON public.voters_registry;
CREATE POLICY "Permitir inserção anônima de eleitores" ON public.voters_registry
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de eleitores" ON public.voters_registry;
CREATE POLICY "Permitir leitura pública de eleitores" ON public.voters_registry
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualização de contato do próprio eleitor" ON public.voters_registry;
CREATE POLICY "Permitir atualização de contato do próprio eleitor" ON public.voters_registry
  FOR UPDATE USING (true);
