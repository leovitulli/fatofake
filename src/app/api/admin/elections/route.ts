import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

function checkAuthorization(request: Request): boolean {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || searchParams.get('key') || searchParams.get('cpf') || '';

  const DEVELOPER_ADMIN_CPF = (process.env.ADMIN_DEVELOPER_CPF || process.env.NEXT_PUBLIC_ADMIN_CPF || '22135939811').replace(/\D/g, '');
  const cleanTokenCpf = token.replace(/\D/g, '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin@fatosfakes2026';

  return (cleanTokenCpf && cleanTokenCpf === DEVELOPER_ADMIN_CPF) || token === adminPassword;
}

/**
 * GET /api/admin/elections
 * Retorna as eleições ativas e o arquivo histórico mantido em sigilo para o desenvolvedor
 */
export async function GET(request: Request) {
  if (!checkAuthorization(request)) {
    return NextResponse.json(
      { success: false, error: 'Acesso restrito ao desenvolvedor oficial.' },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    const { data: allPolls, error } = await supabase
      .from('election_polls')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const activePolls = (allPolls || []).filter(p => !p.id.startsWith('archive-') && p.id !== 'voters-cloud-registry');
    const archivedPolls = (allPolls || []).filter(p => p.id.startsWith('archive-'));

    return NextResponse.json({
      success: true,
      activePolls,
      archivedPolls,
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
      }
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

/**
 * POST /api/admin/elections
 * Permite arquivar uma eleição encerrada ou criar/zerar novas eleições
 */
export async function POST(request: Request) {
  if (!checkAuthorization(request)) {
    return NextResponse.json(
      { success: false, error: 'Acesso restrito ao desenvolvedor oficial.' },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const { action, pollId, newPoll } = body;
    const supabase = getSupabaseAdmin();

    // 1. ARQUIVAR E CONGELAR ELEIÇÃO ATUAL
    if (action === 'archive_and_freeze') {
      if (!pollId) {
        return NextResponse.json({ success: false, error: 'ID da eleição não fornecido.' }, { status: 400 });
      }

      // Puxa os dados da eleição atual
      const { data: currentPoll } = await supabase
        .from('election_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (!currentPoll) {
        return NextResponse.json({ success: false, error: 'Eleição não encontrada.' }, { status: 404 });
      }

      // Salva snapshot no arquivo histórico
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveId = `archive-${pollId}-${timestamp}`;

      const { error: archiveErr } = await supabase
        .from('election_polls')
        .insert({
          id: archiveId,
          title: `[ARQUIVADO] ${currentPoll.title}`,
          role: currentPoll.role,
          state: currentPoll.state,
          round: currentPoll.round,
          survey_date: currentPoll.survey_date,
          total_votes: currentPoll.total_votes,
          candidates: currentPoll.candidates,
          created_at: new Date().toISOString(),
        });

      if (archiveErr) {
        return NextResponse.json({ success: false, error: archiveErr.message }, { status: 500 });
      }

      // Zera os votos da eleição atual para um novo ciclo limpo
      const resetCandidates = (currentPoll.candidates || []).map((c: any) => ({
        ...c,
        votes: 0,
      }));

      await supabase
        .from('election_polls')
        .update({
          total_votes: 0,
          candidates: resetCandidates,
        })
        .eq('id', pollId);

      // Limpa as cédulas correspondentes na urna
      await supabase
        .from('poll_votes')
        .delete()
        .eq('poll_id', pollId);

      return NextResponse.json({
        success: true,
        message: 'Eleição arquivada com sucesso no histórico administrativo e urna reiniciada para o novo ciclo.',
        archiveId,
      });
    }

    // 2. CRIAR NOVA ELEIÇÃO / PLEITO
    if (action === 'create_poll') {
      if (!newPoll || !newPoll.id || !newPoll.title) {
        return NextResponse.json({ success: false, error: 'Dados da nova eleição inválidos.' }, { status: 400 });
      }

      const { data, error } = await supabase
        .from('election_polls')
        .insert({
          id: newPoll.id,
          title: newPoll.title,
          role: newPoll.role || 'Candidato',
          state: newPoll.state || 'BR',
          round: newPoll.round || '1º Turno',
          survey_date: newPoll.survey_date || '2026',
          total_votes: 0,
          candidates: newPoll.candidates || [],
          created_at: new Date().toISOString(),
        })
        .select();

      if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Nova eleição cadastrada com sucesso na plataforma.',
        poll: data?.[0],
      });
    }

    // 3. RESET DE ELEIÇÃO ESPECÍFICA
    if (action === 'reset_poll') {
      if (!pollId) {
        return NextResponse.json({ success: false, error: 'ID da eleição não fornecido.' }, { status: 400 });
      }

      const { data: poll } = await supabase
        .from('election_polls')
        .select('*')
        .eq('id', pollId)
        .single();

      if (poll) {
        const resetCandidates = (poll.candidates || []).map((c: any) => ({ ...c, votes: 0 }));
        await supabase
          .from('election_polls')
          .update({ total_votes: 0, candidates: resetCandidates })
          .eq('id', pollId);

        await supabase.from('poll_votes').delete().eq('poll_id', pollId);
      }

      return NextResponse.json({
        success: true,
        message: `Eleição ${pollId} zerada com sucesso.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Ação desconhecida.' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
