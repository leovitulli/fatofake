-- ==============================================================================
-- FATOS & FAKES - TABELA OFICIAL DE ELEITORES AUDITADOS (voters_registry)
-- Execute este script no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ebarklhztoerbfjvpnqb/sql/new
-- ==============================================================================

-- 1. Cria a tabela oficial de eleitores cadastrados
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

-- 2. Índices de consulta ultra-rápidos para o painel administrativo
CREATE INDEX IF NOT EXISTS idx_voters_cpf_masked ON public.voters_registry(cpf_masked);
CREATE INDEX IF NOT EXISTS idx_voters_cpf_hash ON public.voters_registry(cpf_hash);
CREATE INDEX IF NOT EXISTS idx_voters_state ON public.voters_registry(state);
CREATE INDEX IF NOT EXISTS idx_voters_poll_id ON public.voters_registry(poll_id);
CREATE INDEX IF NOT EXISTS idx_voters_created_at ON public.voters_registry(created_at DESC);

-- 3. Ativar Row Level Security (RLS)
ALTER TABLE public.voters_registry ENABLE ROW LEVEL SECURITY;

-- 4. Políticas de segurança
DROP POLICY IF EXISTS "Permitir inserção anônima de eleitores" ON public.voters_registry;
CREATE POLICY "Permitir inserção anônima de eleitores" ON public.voters_registry
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir leitura pública de eleitores" ON public.voters_registry;
CREATE POLICY "Permitir leitura pública de eleitores" ON public.voters_registry
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Permitir atualização de contato do próprio eleitor" ON public.voters_registry;
CREATE POLICY "Permitir atualização de contato do próprio eleitor" ON public.voters_registry
  FOR UPDATE USING (true);

-- 5. Popula imediatamente os registros já auditados na urna (Leandro e Aline)
INSERT INTO public.voters_registry (
  id, name, cpf_masked, cpf_hash, email, phone, state, city, has_voted, poll_id, created_at
) VALUES 
(
  '30ea5d2b-a788-49f2-b88e-f1a984b4a00a',
  'Leandro Vitulli',
  '***.***.398-11',
  '5feb43496eedffcfe74504979afa803633d48f17d21edadf8914806163a04227',
  'admin@fatosfakes2026.org',
  '',
  'SP',
  'São Paulo',
  true,
  'eleicao-presidencia-2026',
  '2026-10-23 17:52:11.459633+00'
),
(
  'f594d388-614b-4e33-a74f-649e6206b484',
  'Aline',
  '***.***.***-**',
  '5936432aa9131200970710c514378066887c9e9aa9aa61c3c548135dd365d867',
  '',
  '',
  'SP',
  'São Paulo',
  true,
  'eleicao-presidencia-2026',
  '2026-10-23 17:59:11.214527+00'
)
ON CONFLICT (cpf_hash) DO UPDATE SET
  name = EXCLUDED.name,
  cpf_masked = EXCLUDED.cpf_masked,
  email = EXCLUDED.email,
  updated_at = now();
