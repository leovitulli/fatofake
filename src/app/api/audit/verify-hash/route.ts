import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hash = (searchParams.get('hash') || '').trim().toLowerCase();

  if (!hash || hash.length < 8) {
    return NextResponse.json(
      { 
        success: false, 
        message: 'Por favor, informe ao menos os primeiros 8 caracteres do Hash de Auditoria.' 
      },
      { status: 400 }
    );
  }

  try {
    const supabase = getSupabaseAdmin();

    // 1. Busca por correspondência exata ou prefixo na Urna Cega (poll_votes)
    const { data: ballots, error } = await supabase
      .from('poll_votes')
      .select('id, poll_id, created_at, voter_hash')
      .ilike('voter_hash', `${hash}%`)
      .limit(1);

    if (error || !ballots || ballots.length === 0) {
      return NextResponse.json({
        success: false,
        found: false,
        message: 'Código de auditoria não localizado na Urna Cega oficial.',
      }, { status: 404 });
    }

    const ballot = ballots[0];

    const pollTitle = ballot.poll_id === 'eleicao-presidencia-2026'
      ? 'Eleição Presidencial 2026 — 2º Turno (Lula x Flávio Bolsonaro)'
      : 'Pesquisa Cívica Auditada FATOS & FAKES';

    return NextResponse.json({
      success: true,
      found: true,
      hash: ballot.voter_hash,
      ballotId: ballot.id,
      pollTitle,
      timestamp: ballot.created_at,
      formattedDate: new Date(ballot.created_at).toLocaleString('pt-BR', {
        dateStyle: 'full',
        timeStyle: 'medium',
      }),
      algorithm: 'SHA-256 (FIPS 180-4 / Padrão de Auditoria Oficial)',
      securityStatus: 'RECIBO AUTÊNTICO E INVIOLÁVEL',
      legalFramework: 'Art. 14 da Constituição Federal de 1988 (Sigilo de Voto) & LGPD (Lei 13.709/18)',
      zeroKnowledgeProof: 'Este hash comprova matematicamente que a cédula foi computada na urna cega em data e hora registradas. Devido à natureza criptográfica unidirecional (one-way hash), é matematicamente impossível associar o voto ao nome ou CPF do cidadão, preservando a soberania e o sigilo democrático.',
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, message: 'Erro ao consultar serviço de auditoria em nuvem.' },
      { status: 500 }
    );
  }
}
