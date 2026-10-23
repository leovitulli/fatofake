import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { INITIAL_POLITICIANS } from '@/data/politicians';
import { INITIAL_FACT_CHECKS } from '@/data/factChecks';
import { INITIAL_JUDICIAL_PROCESSES } from '@/data/judicialProcesses';
import { INITIAL_POLLS } from '@/data/polls';

export async function GET() {
  const supabase = getSupabaseAdmin();

  try {
    // 1. Verificar se a tabela politicians existe
    const { error: checkError } = await supabase.from('politicians').select('id').limit(1);
    if (checkError) {
      return NextResponse.json({
        success: false,
        error: checkError.message,
        instruction: 'As tabelas ainda não foram criadas no Supabase. Abra o painel do Supabase > SQL Editor e execute o conteúdo de "supabase/setup_and_seed.sql". Em seguida, recarregue esta rota.'
      }, { status: 400 });
    }

    // 2. Inserir/Atualizar Políticos
    const polRows = INITIAL_POLITICIANS.map(p => ({
      id: p.id,
      name: p.name,
      popular_name: p.popularName,
      role: p.role,
      candidate_for: p.candidateFor,
      state: p.state,
      party: p.party,
      photo_url: p.photoUrl,
      bio: p.bio,
      already_elected: p.alreadyElected || false,
      current_mandate: p.currentMandate || null,
      eligibility_status: p.eligibilityStatus || 'Ficha Limpa Apto',
      eligibility_details: p.eligibilityDetails || null,
      stats: p.stats,
    }));

    const { error: polError } = await supabase
      .from('politicians')
      .upsert(polRows, { onConflict: 'id' });

    if (polError) throw polError;

    // 3. Inserir/Atualizar Checagens (Fact Checks)
    const checkRows = INITIAL_FACT_CHECKS.map(c => ({
      id: c.id,
      title: c.title,
      verdict: c.verdict,
      politician_id: c.politician.id,
      politician_data: c.politician,
      summary: c.summary,
      detailed_explanation: c.detailedExplanation,
      viral_claim: c.viralClaim || null,
      viral_post_urls: c.viralPostUrls || [],
      source_agency: c.sourceAgency,
      source_url: c.sourceUrl,
      official_proof_url: c.officialProofUrl || null,
      sources: c.sources || [],
      published_at: c.publishedAt,
      category: c.category,
      tags: c.tags,
    }));

    const { error: factError } = await supabase
      .from('fact_checks')
      .upsert(checkRows, { onConflict: 'id' });

    if (factError) throw factError;

    // 4. Inserir/Atualizar Processos Judiciais
    const procRows = INITIAL_JUDICIAL_PROCESSES.map(pr => ({
      id: pr.id,
      process_number: pr.processNumber,
      court: pr.court,
      politician_id: pr.politicianId,
      title: pr.subject,
      description: pr.summary,
      status: pr.status,
      current_phase: pr.statusLabel,
      crime_type: pr.subject,
      source_url: pr.courtUrl,
      official_doc_url: { name: pr.court, url: pr.courtUrl },
      last_update: pr.lastUpdate,
    }));

    const { error: procError } = await supabase
      .from('judicial_processes')
      .upsert(procRows, { onConflict: 'id' });

    if (procError) throw procError;

    // 5. Inserir/Atualizar Pesquisas Eleitorais
    const pollRows = INITIAL_POLLS.map(pl => ({
      id: pl.id,
      title: pl.title,
      role: pl.role,
      state: pl.state,
      round: pl.round || '2º Turno',
      survey_date: pl.surveyDate || null,
      total_votes: pl.totalVotes,
      candidates: pl.candidates,
    }));

    const { error: pollError } = await supabase
      .from('election_polls')
      .upsert(pollRows, { onConflict: 'id' });

    if (pollError) throw pollError;

    return NextResponse.json({
      success: true,
      message: 'Dados carregados com sucesso no Supabase!',
      counts: {
        politicians: polRows.length,
        factChecks: checkRows.length,
        judicialProcesses: procRows.length,
        electionPolls: pollRows.length,
      }
    });

  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error)
    }, { status: 500 });
  }
}
