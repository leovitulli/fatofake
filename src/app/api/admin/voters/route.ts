import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

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
    const { data: registryVoters } = await supabase
      .from('voters_registry')
      .select('*')
      .order('created_at', { ascending: false });

    // 3. Consulta registros na nuvem na tabela election_polls (voters-cloud-registry)
    let cloudVoters: any[] = [];
    try {
      const { data: cloudReg } = await supabase
        .from('election_polls')
        .select('candidates')
        .eq('id', 'voters-cloud-registry')
        .single();
      if (cloudReg && Array.isArray(cloudReg.candidates)) {
        cloudVoters = cloudReg.candidates;
      }
    } catch {
      // ignore
    }

    // Mapa de eleitores únicos por Hash SHA-256
    const voterMap = new Map<string, any>();

    // Prioridade 1: Dados do voters_registry oficial
    if (registryVoters && registryVoters.length > 0) {
      registryVoters.forEach((v: any) => {
        if (v.cpf_hash) voterMap.set(v.cpf_hash, v);
      });
    }

    // Prioridade 2: Dados sincronizados na nuvem em voters-cloud-registry
    if (cloudVoters.length > 0) {
      cloudVoters.forEach((v: any) => {
        const hash = v.cpf_hash || v.cpfHash;
        if (hash) {
          const existing = voterMap.get(hash);
          if (!existing) {
            voterMap.set(hash, v);
          } else if ((!existing.name || existing.name === 'Eleitor Cívico Auditado') && v.name) {
            voterMap.set(hash, { ...existing, ...v });
          }
        }
      });
    }

    // Prioridade 3: Cédulas depositadas na urna cega (garante que 100% dos votos apareçam)
    if (realBallots && realBallots.length > 0) {
      realBallots.forEach((b: any, idx: number) => {
        const hash = b.voter_hash;
        if (hash && !voterMap.has(hash)) {
          voterMap.set(hash, {
            id: b.id || `ballot-voter-${idx}`,
            name: 'Eleitor Cívico Auditado',
            cpf_masked: '***.***.***-**',
            cpf_hash: hash,
            email: '',
            phone: '',
            state: 'SP',
            city: 'São Paulo',
            has_voted: true,
            poll_id: b.poll_id || 'eleicao-presidencia-2026',
            created_at: b.created_at,
            is_verified_ballot: true,
          });
        }
      });
    }

    const combinedVoters = Array.from(voterMap.values());
    const totalVoters = combinedVoters.length;
    const totalBallots = realBallots?.length || combinedVoters.length;
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
      source: 'cloud_synchronized',
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
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
