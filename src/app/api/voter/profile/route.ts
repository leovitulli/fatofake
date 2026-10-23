import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { validarCPF, mascararCPF } from '@/lib/voteService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, adminKey } = body;

    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin@fatosfakes2026';

    // 1. Verificação se é login direto de administrador
    if (adminKey && adminKey === defaultAdminPass) {
      return NextResponse.json({
        success: true,
        role: 'admin',
        message: 'Acesso Administrativo autorizado.',
      });
    }

    // 2. Verificação de login de Cidadão / Eleitor por CPF
    if (!cpf) {
      return NextResponse.json(
        { success: false, error: 'Por favor, informe seu CPF para consultar o cadastro.' },
        { status: 400 }
      );
    }

    const cleanCPF = cpf.replace(/\D/g, '');
    if (!validarCPF(cleanCPF)) {
      return NextResponse.json(
        { success: false, error: 'CPF inválido. Por favor, verifique os dígitos digitados.' },
        { status: 400 }
      );
    }

    const masked = mascararCPF(cleanCPF);
    const supabase = getSupabaseAdmin();

    // Busca no banco Supabase na tabela voters_registry
    const { data, error } = await supabase
      .from('voters_registry')
      .select('*')
      .eq('cpf_masked', masked)
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        {
          success: false,
          notFound: true,
          error: 'Nenhum registro encontrado para este CPF. Se você ainda não votou, participe da pesquisa eleitoral na página inicial para ativar seu cadastro cívico.',
        },
        { status: 404 }
      );
    }

    const voter = data[0];
    return NextResponse.json({
      success: true,
      role: 'voter',
      voter: {
        id: voter.id,
        name: voter.name,
        cpf_masked: voter.cpf_masked,
        cpf_hash: voter.cpf_hash,
        email: voter.email || '',
        phone: voter.phone || '',
        state: voter.state,
        city: voter.city,
        has_voted: voter.has_voted,
        poll_id: voter.poll_id,
        created_at: voter.created_at,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro interno no servidor ao consultar o cadastro.' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, cpf_hash, cpfHash, email, phone, city, state } = body;
    const targetHash = cpf_hash || cpfHash;

    if (!id && !targetHash) {
      return NextResponse.json(
        { success: false, error: 'Identificador do eleitor não fornecido.' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const updatePayload: Record<string, any> = {
      email: email?.trim() || null,
      phone: phone?.trim() || null,
      city: city?.trim() || '',
      state: state?.trim() || '',
    };

    let query = supabase.from('voters_registry').update(updatePayload);

    if (id) {
      query = query.eq('id', id);
    } else {
      query = query.eq('cpf_hash', targetHash);
    }

    const { data, error } = await query.select();

    if (error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Dados cadastrais atualizados com sucesso no banco de dados!',
      voter: data && data.length > 0 ? data[0] : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Erro ao atualizar dados cadastrais.' },
      { status: 500 }
    );
  }
}
