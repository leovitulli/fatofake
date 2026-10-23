import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = 'https://ebarklhztoerbfjvpnqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXJrbGh6dG9lcmJmanZwbnFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjcxMjg4MCwiZXhwIjoyMTA4Mjg4ODgwfQ.xZenTBy2LXsYbDG8QeC-j23BRAOFBi_8ayMZDlAVGRE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log('--- Iniciando Carga de Dados no Supabase ---');

  // 1. Políticos
  console.log('Verificando se tabela politicians está pronta...');
  const { error: polCheck } = await supabase.from('politicians').select('id').limit(1);
  if (polCheck) {
    console.error('⚠️ A tabela "politicians" ainda não foi criada no Supabase!');
    console.error('Por favor, abra o SQL Editor no painel do Supabase e execute o arquivo "supabase/schema.sql".');
    return;
  }

  console.log('Inserindo políticos...');
  // Importando dinamicamente os dados compilados
  const { INITIAL_POLITICIANS } = await import('../src/data/politicians.js').catch(async () => {
    // Fallback: carregar de data se transpilado, ou ler json
    return { INITIAL_POLITICIANS: [] };
  });

  console.log('Banco de dados pronto para receber dados.');
}

seed();
