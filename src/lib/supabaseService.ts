import { supabase } from './supabase';
import { FactCheck, Politician, JudicialProcess, ElectionPoll } from '@/types';
import { INITIAL_FACT_CHECKS } from '@/data/factChecks';
import { INITIAL_POLITICIANS } from '@/data/politicians';
import { INITIAL_JUDICIAL_PROCESSES } from '@/data/judicialProcesses';
import { INITIAL_POLLS } from '@/data/polls';

/**
 * Mapeia registro bruto do Supabase para o tipo FactCheck da aplicação
 */
function mapDbFactCheck(row: any): FactCheck {
  return {
    id: row.id,
    title: row.title,
    verdict: row.verdict,
    politician: row.politician_data,
    summary: row.summary,
    detailedExplanation: row.detailed_explanation,
    viralClaim: row.viral_claim,
    viralPostUrls: row.viral_post_urls || [],
    sourceAgency: row.source_agency,
    sourceUrl: row.source_url,
    officialProofUrl: row.official_proof_url,
    sources: row.sources || [],
    publishedAt: row.published_at,
    category: row.category,
    tags: row.tags || [],
  };
}

/**
 * Busca checagens no Supabase com fallback instantâneo para dados locais
 */
export async function getFactChecks(): Promise<FactCheck[]> {
  try {
    const { data, error } = await supabase
      .from('fact_checks')
      .select('*')
      .order('published_at', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_FACT_CHECKS;
    }

    return data.map(mapDbFactCheck);
  } catch (err) {
    console.warn('Conexão Supabase offline ou tabela vazia. Usando dados locais.', err);
    return INITIAL_FACT_CHECKS;
  }
}

/**
 * Busca políticos no Supabase com fallback local
 */
export async function getPoliticians(): Promise<Politician[]> {
  try {
    const { data, error } = await supabase
      .from('politicians')
      .select('*');

    if (error || !data || data.length === 0) {
      return INITIAL_POLITICIANS;
    }

    return data.map((row: any): Politician => ({
      id: row.id,
      name: row.name,
      popularName: row.popular_name,
      role: row.role,
      candidateFor: row.candidate_for,
      state: row.state,
      party: row.party,
      photoUrl: row.photo_url,
      bio: row.bio,
      alreadyElected: row.already_elected,
      currentMandate: row.current_mandate,
      eligibilityStatus: row.eligibility_status,
      eligibilityDetails: row.eligibility_details,
      stats: row.stats || { totalChecks: 0, fatos: 0, fakes: 0, enganosos: 0 },
    }));
  } catch (err) {
    return INITIAL_POLITICIANS;
  }
}

/**
 * Busca processos judiciais no Supabase com fallback local
 */
export async function getJudicialProcesses(): Promise<JudicialProcess[]> {
  try {
    const { data, error } = await supabase
      .from('judicial_processes')
      .select('*')
      .order('last_update', { ascending: false });

    if (error || !data || data.length === 0) {
      return INITIAL_JUDICIAL_PROCESSES;
    }

    return data.map((row: any): JudicialProcess => ({
      id: row.id,
      politicianId: row.politician_id,
      politicianName: row.politician_name || '',
      politicianRole: row.politician_role || 'Presidente',
      processNumber: row.process_number,
      court: row.court,
      subject: row.subject || row.title || '',
      status: row.status,
      statusLabel: row.status_label || row.status,
      summary: row.summary || row.description || '',
      defensePosition: row.defense_position || '',
      lastUpdate: row.last_update,
      courtUrl: row.court_url || row.source_url || '',
    }));
  } catch (err) {
    return INITIAL_JUDICIAL_PROCESSES;
  }
}

/**
 * Busca pesquisas eleitorais
 */
export async function getElectionPolls(): Promise<ElectionPoll[]> {
  try {
    const { data, error } = await supabase
      .from('election_polls')
      .select('*');

    if (error || !data || data.length === 0) {
      return INITIAL_POLLS;
    }

    return data.map((row: any): ElectionPoll => ({
      id: row.id,
      title: row.title,
      role: row.role,
      state: row.state,
      year: row.year || 2026,
      description: row.description || '',
      status: row.status || 'ABERTA',
      round: row.round,
      surveyDate: row.survey_date,
      totalVotes: row.total_votes || 0,
      candidates: row.candidates || [],
    }));
  } catch (err) {
    return INITIAL_POLLS;
  }
}

/**
 * Registra voto anônimo e seguro no Supabase com hash SHA-256 do CPF
 */
export async function submitAnonymousVote(pollId: string, candidateId: string, voterHash: string): Promise<{ success: boolean; message: string }> {
  try {
    const { error } = await supabase
      .from('poll_votes')
      .insert({
        poll_id: pollId,
        candidate_id: candidateId,
        voter_hash: voterHash,
      });

    if (error) {
      if (error.code === '23505') { // Violação de constraint unique
        return { success: false, message: 'Este documento já registrou voto nesta pesquisa eleitoral.' };
      }
      return { success: false, message: 'Erro ao registrar voto no servidor.' };
    }

    return { success: true, message: 'Voto computado com sigilo absoluto e auditoria criptográfica!' };
  } catch (err) {
    return { success: false, message: 'Falha de comunicação com o banco de dados.' };
  }
}
