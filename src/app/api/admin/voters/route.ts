import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || searchParams.get('key') || searchParams.get('cpf') || '';

  const DEVELOPER_ADMIN_CPF = (process.env.ADMIN_DEVELOPER_CPF || process.env.NEXT_PUBLIC_ADMIN_CPF || '22135939811').replace(/\D/g, '');
  const cleanTokenCpf = token.replace(/\D/g, '');
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin@fatosfakes2026';

  const isAuthorized = (cleanTokenCpf && cleanTokenCpf === DEVELOPER_ADMIN_CPF) || token === adminPassword;

  if (!isAuthorized) {
    return NextResponse.json(
      {
        success: false,
        error: 'Acesso restrito. Chave de autenticação administrativa inválida.',
      },
      { status: 401 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Consulta cédulas reais gravadas na urna cega do Supabase
    const { data: realBallots, error: ballotsErr } = await supabase
      .from('poll_votes')
      .select('*')
      .order('created_at', { ascending: false });

    // 2. Consulta registros de eleitores na tabela voters_registry (se já existir)
    const { data: registryVoters, error: votersError } = await supabase
      .from('voters_registry')
      .select('*')
      .order('created_at', { ascending: false });

    let combinedVoters: any[] = [];

    // Retorna apenas os registros reais existentes na tabela de eleitores
    if (registryVoters && registryVoters.length > 0) {
      combinedVoters = [...registryVoters];
    }

    const totalVoters = combinedVoters.length;
    const totalBallots = realBallots?.length || 0;
    const uniqueStates = Array.from(
      new Set(combinedVoters.map((v: any) => v.state).filter(Boolean))
    );

    return NextResponse.json({
      success: true,
      voters: combinedVoters,
      stats: {
        totalVoters,
        totalBallots,
        statesCount: uniqueStates.length,
        states: uniqueStates,
      },
      source: registryVoters && registryVoters.length > 0 ? 'supabase_registry' : 'empty_clean',
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Erro interno ao consultar lista de eleitores.',
        voters: [],
        stats: { totalVoters: 0, totalBallots: 0, statesCount: 0, states: [] },
      },
      { status: 500 }
    );
  }
}
