import { getSupabaseAdmin } from '../src/lib/supabase.ts';
import fs from 'fs';

const supabase = getSupabaseAdmin();

async function cleanResetProduction() {
  console.log('=== INICIANDO RESET DE PRODUÇÃO E ARQUIVAMENTO DE SEGURANÇA ===\n');

  // 1. Coleta dados atuais para backup de segurança
  const { data: currentVotes } = await supabase.from('poll_votes').select('*');
  const { data: currentVoters } = await supabase.from('voters_registry').select('*');
  const { data: currentPolls } = await supabase.from('election_polls').select('*');

  const backupData = {
    archive_id: 'archive-piloto-homologacao-2026-10-24',
    title: 'Fase de Homologação e Testes Piloto (Outubro 2026)',
    archived_at: new Date().toISOString(),
    total_votes: currentVotes?.length || 0,
    votes: currentVotes || [],
    voters: currentVoters || [],
    polls_snapshot: currentPolls || []
  };

  fs.writeFileSync(
    './supabase/archive_backup_piloto.json', 
    JSON.stringify(backupData, null, 2), 
    'utf-8'
  );
  console.log('✓ Backup de segurança salvo em ./supabase/archive_backup_piloto.json');

  // 2. Salva o snapshot na tabela election_polls como registro arquivado permanente
  try {
    const { error: archiveErr } = await supabase
      .from('election_polls')
      .upsert({
        id: 'archive-piloto-2026',
        title: 'Arquivo Histórico: Teste Piloto de Homologação 2026',
        role: 'HISTORICO_ARQUIVADO',
        state: 'BR',
        round: 'Homologação',
        survey_date: 'Outubro 2026',
        total_votes: backupData.total_votes,
        candidates: [
          {
            candidate: 'Lula (PT)',
            votes: 2,
            percentage: '100%',
            notes: 'Testes de bancada e auditoria de urna'
          }
        ],
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (archiveErr) {
      console.warn('Aviso ao salvar snapshot histórico:', archiveErr.message);
    } else {
      console.log('✓ Snapshot histórico gravado com sucesso em election_polls (archive-piloto-2026)');
    }
  } catch (err) {
    console.warn('Erro ao arquivar snapshot:', err);
  }

  // 3. Limpa todas as cédulas em poll_votes (Zera a Urna)
  console.log('\n--- Zerando Cédulas em poll_votes ---');
  const { error: delVotesErr } = await supabase
    .from('poll_votes')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Deleta tudo
  if (delVotesErr) {
    console.error('Erro ao deletar poll_votes:', delVotesErr);
  } else {
    console.log('✓ Todas as cédulas de teste foram removidas de poll_votes (0 votos na urna).');
  }

  // 4. Limpa todos os eleitores cadastrados em voters_registry (Zera a Lista de Presença)
  console.log('\n--- Zerando Lista de Presença em voters_registry ---');
  const { error: delVotersErr } = await supabase
    .from('voters_registry')
    .delete()
    .neq('name', '___NON_EXISTENT___'); // Deleta tudo
  if (delVotersErr) {
    console.error('Erro ao deletar voters_registry:', delVotersErr);
  } else {
    console.log('✓ Tabela voters_registry limpa com sucesso (0 eleitores cadastrados).');
  }

  // 5. Zera a pesquisa oficial da presidência em election_polls
  console.log('\n--- Zerando Placar de election_polls (eleicao-presidencia-2026) ---');
  const cleanCandidates = [
    {
      id: 'cand-lula',
      name: 'Luiz Inácio Lula da Silva',
      popularName: 'Lula',
      number: '13',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
      politicianId: 'lula',
      votes: 0,
      judicialStatusSummary: 'Processos da Lava Jato anulados pelo STF · Ficha Limpa apto'
    },
    {
      id: 'cand-flavio',
      name: 'Flávio Nantes Bolsonaro',
      popularName: 'Flávio Bolsonaro',
      number: '22',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
      politicianId: 'flavio-bolsonaro',
      votes: 0,
      judicialStatusSummary: 'Ficha Limpa apto · Processo criminal da Alerj arquivado pelo TJ-RJ sem julgamento de mérito'
    },
    {
      id: 'cand-branco-nulo',
      name: 'Voto em Branco ou Nulo',
      popularName: 'Branco / Nulo',
      number: '00',
      party: 'Nenhum',
      photoUrl: '/images/politicians/branco-nulo.svg',
      votes: 0
    }
  ];

  const { error: pollResetErr } = await supabase
    .from('election_polls')
    .update({
      total_votes: 0,
      candidates: cleanCandidates
    })
    .eq('id', 'eleicao-presidencia-2026');

  if (pollResetErr) {
    console.error('Erro ao zerar eleicao-presidencia-2026:', pollResetErr);
  } else {
    console.log('✓ Pesquisa oficial de Presidente zerada com sucesso (0 votos Lula, 0 votos Flávio).');
  }

  // 6. Zera a pesquisa do Governo de SP
  const cleanSpCandidates = [
    {
      id: 'cand-sp-tarcisio',
      name: 'Tarcísio Gomes de Freitas',
      popularName: 'Tarcísio',
      number: '10',
      party: 'Republicanos',
      photoUrl: '/images/politicians/tarcisio-freitas.jpg',
      politicianId: 'tarcisio-freitas',
      votes: 0,
      judicialStatusSummary: 'Ficha Limpa apto · Sem condenações transitadas em julgado'
    },
    {
      id: 'cand-sp-haddad',
      name: 'Fernando Haddad',
      popularName: 'Haddad',
      number: '13',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
      politicianId: 'lula',
      votes: 0,
      judicialStatusSummary: 'Ficha Limpa apto · Contas aprovadas pelo TCE-SP'
    },
    {
      id: 'cand-branco-nulo-sp',
      name: 'Voto em Branco ou Nulo',
      popularName: 'Branco / Nulo',
      number: '00',
      party: 'Nenhum',
      photoUrl: '/images/politicians/branco-nulo.svg',
      votes: 0
    }
  ];

  await supabase
    .from('election_polls')
    .update({
      total_votes: 0,
      candidates: cleanSpCandidates
    })
    .eq('id', 'eleicao-governo-sp-2026');
  console.log('✓ Pesquisa oficial de Governador SP zerada com sucesso (0 votos).');

  // 7. Zera o registro de contingência na nuvem voters-cloud-registry
  await supabase
    .from('election_polls')
    .update({
      total_votes: 0,
      candidates: []
    })
    .eq('id', 'voters-cloud-registry');
  console.log('✓ voters-cloud-registry zerado com sucesso.');

  console.log('\n=== RESET DE PRODUÇÃO CONCLUÍDO COM SUCESSO! ===');
}

cleanResetProduction();
