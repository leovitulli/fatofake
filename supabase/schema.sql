-- ==============================================================================
-- SCHEMA DO BANCO DE DADOS: FATOS & FAKES 2026 (SUPABASE / POSTGRESQL)
-- ==============================================================================

-- 1. Habilitar extensões úteis para busca textual em português e sem acentos
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- 2. Tabela de Políticos e Autoridades
CREATE TABLE IF NOT EXISTS politicians (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  popular_name TEXT,
  role TEXT NOT NULL,
  candidate_for TEXT,
  state TEXT NOT NULL,
  party TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  already_elected BOOLEAN DEFAULT FALSE,
  current_mandate TEXT,
  eligibility_status TEXT DEFAULT 'Ficha Limpa Apto',
  eligibility_details TEXT,
  stats JSONB DEFAULT '{"totalChecks": 0, "fatos": 0, "fakes": 0, "enganosos": 0}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabela de Checagens Fato ou Fake
CREATE TABLE IF NOT EXISTS fact_checks (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  verdict TEXT NOT NULL CHECK (verdict IN ('FATO', 'FAKE', 'ENGANOSO')),
  politician_id TEXT REFERENCES politicians(id) ON DELETE SET NULL,
  politician_data JSONB NOT NULL,
  summary TEXT NOT NULL,
  detailed_explanation TEXT NOT NULL,
  viral_claim TEXT,
  viral_post_urls JSONB DEFAULT '[]'::jsonb,
  source_agency TEXT NOT NULL,
  source_url TEXT NOT NULL,
  official_proof_url JSONB,
  sources JSONB DEFAULT '[]'::jsonb,
  published_at DATE DEFAULT CURRENT_DATE,
  category TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabela de Processos Judiciais e Inquéritos
CREATE TABLE IF NOT EXISTS judicial_processes (
  id TEXT PRIMARY KEY,
  process_number TEXT NOT NULL,
  court TEXT NOT NULL,
  politician_id TEXT REFERENCES politicians(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  current_phase TEXT NOT NULL,
  crime_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  official_doc_url JSONB,
  last_update DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabela de Pesquisas Eleitorais e Votação Anônima Criptografada
CREATE TABLE IF NOT EXISTS election_polls (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  role TEXT NOT NULL,
  state TEXT NOT NULL,
  round TEXT DEFAULT '2º Turno',
  survey_date TEXT,
  total_votes INTEGER DEFAULT 0,
  candidates JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id TEXT REFERENCES election_polls(id) ON DELETE CASCADE,
  candidate_id TEXT NOT NULL,
  voter_hash TEXT NOT NULL, -- SHA-256 anônimo do CPF (garante voto único sem expor documento)
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_vote_per_poll UNIQUE (poll_id, voter_hash)
);

-- ==============================================================================
-- ÍNDICES DE ALTA VELOCIDADE (FULL-TEXT SEARCH & TRIGRAMAS)
-- ==============================================================================

CREATE INDEX IF NOT EXISTS idx_fact_checks_politician ON fact_checks(politician_id);
CREATE INDEX IF NOT EXISTS idx_fact_checks_verdict ON fact_checks(verdict);
CREATE INDEX IF NOT EXISTS idx_fact_checks_tags ON fact_checks USING GIN(tags);

-- Índice Trigram para busca difusa instantânea em títulos e resumos
CREATE INDEX IF NOT EXISTS idx_fact_checks_title_trgm ON fact_checks USING GIN(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_fact_checks_summary_trgm ON fact_checks USING GIN(summary gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_politicians_name_trgm ON politicians USING GIN(name gin_trgm_ops);

-- ==============================================================================
-- POLÍTICAS DE SEGURANÇA (ROW LEVEL SECURITY - RLS)
-- ==============================================================================

ALTER TABLE politicians ENABLE ROW LEVEL SECURITY;
ALTER TABLE fact_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE judicial_processes ENABLE ROW LEVEL SECURITY;
ALTER TABLE election_polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE poll_votes ENABLE ROW LEVEL SECURITY;

-- Leitura pública irrestrita para transparência cívica
CREATE POLICY "Public Read Politicians" ON politicians FOR SELECT USING (true);
CREATE POLICY "Public Read FactChecks" ON fact_checks FOR SELECT USING (true);
CREATE POLICY "Public Read Processes" ON judicial_processes FOR SELECT USING (true);
CREATE POLICY "Public Read Polls" ON election_polls FOR SELECT USING (true);

-- Votação: qualquer eleitor pode inserir seu voto anônimo (hash único)
CREATE POLICY "Public Insert Vote" ON poll_votes FOR INSERT WITH CHECK (true);

-- ==============================================================================
-- FUNÇÃO RPC PARA BUSCA INTELIGENTE ULTRA-RÁPIDA
-- ==============================================================================

CREATE OR REPLACE FUNCTION search_fact_checks(search_term TEXT)
RETURNS SETOF fact_checks AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM fact_checks
  WHERE
    unaccent(title) ILIKE '%' || unaccent(search_term) || '%'
    OR unaccent(summary) ILIKE '%' || unaccent(search_term) || '%'
    OR unaccent(detailed_explanation) ILIKE '%' || unaccent(search_term) || '%'
    OR search_term = ANY(tags)
    OR title % search_term
  ORDER BY
    similarity(title, search_term) DESC,
    published_at DESC;
END;
$$ LANGUAGE plpgsql;
