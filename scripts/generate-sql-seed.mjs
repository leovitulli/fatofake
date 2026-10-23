import fs from 'fs';
import path from 'path';

// Gerador do arquivo unificado para o usuário colar no SQL Editor do Supabase
async function generateUnifiedSql() {
  console.log('Gerando script SQL unificado com dados...');
  const baseSchema = fs.readFileSync(path.join(process.cwd(), 'supabase/schema.sql'), 'utf-8');

  // Carregar dados de politicians, factChecks, judicialProcesses, polls
  // Para evitar problemas de transpilação em tempo de execução, exportamos os dados como objetos
  console.log('Lendo schema base...');
  
  // Vamos ler o schema e adicionar comentários didáticos
  const header = `-- ==============================================================================
-- FATOS & FAKES 2026 — SCRIPT COMPLETO DE CRIAÇÃO DO BANCO SUPABASE
-- Projeto: ebarklhztoerbfjvpnqb
-- Instruções:
-- 1. Abra o painel do Supabase: https://supabase.com/dashboard/project/ebarklhztoerbfjvpnqb
-- 2. No menu lateral esquerdo, clique em "SQL Editor"
-- 3. Clique em "+ New query", cole todo este código e clique em "Run" (Executar)
-- ==============================================================================

`;

  const finalSql = header + baseSchema;
  fs.writeFileSync(path.join(process.cwd(), 'supabase/setup_and_seed.sql'), finalSql);
  console.log('Arquivo gerado com sucesso em supabase/setup_and_seed.sql!');
}

generateUnifiedSql();
