import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ebarklhztoerbfjvpnqb.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImViYXJrbGh6dG9lcmJmanZwbnFiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MjcxMjg4MCwiZXhwIjoyMTA4Mjg4ODgwfQ.xZenTBy2LXsYbDG8QeC-j23BRAOFBi_8ayMZDlAVGRE';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testando conexão com Supabase...');
  const { data, error } = await supabase.from('politicians').select('*').limit(1);
  if (error) {
    console.log('Resultado da checagem de tabelas:', error.message);
  } else {
    console.log('Tabela politicians encontrada! Registros:', data?.length);
  }
}

testConnection();
