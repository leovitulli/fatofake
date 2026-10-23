import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '') || searchParams.get('key') || '';

  const adminPassword = process.env.ADMIN_PASSWORD || 'admin@fatosfakes2026';

  if (!token || token !== adminPassword) {
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

    // Consulta registros da lista auditável de presença
    const { data: voters, error: votersError } = await supabase
      .from('voters_registry')
      .select('*')
      .order('created_at', { ascending: false });

    // Consulta total de cédulas anônimas depositadas na urna cega
    const { count: ballotsCount } = await supabase
      .from('poll_votes')
      .select('*', { count: 'exact', head: true });

    if (votersError) {
      return NextResponse.json(
        {
          success: false,
          error: votersError.message,
          voters: [],
          stats: { totalVoters: 0, totalBallots: 0 },
        },
        { status: 500 }
      );
    }

    const totalVoters = voters?.length || 0;
    const totalBallots = ballotsCount ?? totalVoters;
    const uniqueStates = Array.from(
      new Set(voters?.map((v: any) => v.state).filter(Boolean) || [])
    );

    return NextResponse.json({
      success: true,
      voters: voters || [],
      stats: {
        totalVoters,
        totalBallots,
        statesCount: uniqueStates.length,
        states: uniqueStates,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: false,
        error: err?.message || 'Erro interno ao consultar lista de eleitores.',
      },
      { status: 500 }
    );
  }
}
