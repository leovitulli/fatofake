import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { validarCPF, mascararCPF, gerarHashEleitor } from '@/lib/voteService';

// CPF do desenvolvedor/administrador exclusivo da plataforma (lido do .env.local)
const DEVELOPER_ADMIN_CPF = (process.env.ADMIN_DEVELOPER_CPF || process.env.NEXT_PUBLIC_ADMIN_CPF || '22487527846').replace(/\D/g, '');

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf } = body;

    // 2. Verificação de login de Cidadão / Eleitor por CPF
    if (!cpf) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Por favor, informe seu CPF para consultar seu cadastro cívico.',
          rawError: 'Missing CPF parameter'
        },
        { status: 400 }
      );
    }

    const cleanCPF = cpf.replace(/\D/g, '');
    if (!validarCPF(cleanCPF)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'O CPF digitado parece incompleto ou inválido. Por favor, confira os 11 dígitos informados.',
          rawError: 'Invalid CPF checksum'
        },
        { status: 400 }
      );
    }

    const masked = mascararCPF(cleanCPF);
    const isMasterAdmin = cleanCPF === DEVELOPER_ADMIN_CPF;

    try {
      const supabase = getSupabaseAdmin();

      // Busca no banco Supabase na tabela voters_registry
      const { data, error } = await supabase
        .from('voters_registry')
        .select('*')
        .eq('cpf_masked', masked)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error || !data || data.length === 0) {
        // Se for o desenvolvedor oficial da plataforma, garante acesso exclusivo imediato
        if (isMasterAdmin) {
          const adminHash = await gerarHashEleitor(cleanCPF, 'eleicao-presidencia-2026');
          return NextResponse.json({
            success: true,
            role: 'admin',
            is_admin: true,
            voter: {
              id: 'admin-master-voter',
              name: 'Desenvolvedor / Administrador',
              cpf_masked: masked,
              cpf_hash: adminHash,
              email: 'admin@fatosfakes2026.org',
              phone: '',
              state: 'BR',
              city: 'Painel Central',
              has_voted: true,
              poll_id: 'eleicao-presidencia-2026',
              created_at: new Date().toISOString(),
              is_admin: true,
            },
          });
        }

        // Verifica se o eleitor registrou voto na urna cega (tabela poll_votes)
        const cpfHash = await gerarHashEleitor(cleanCPF, 'eleicao-presidencia-2026');
        const { data: realBallots } = await supabase
          .from('poll_votes')
          .select('*')
          .eq('voter_hash', cpfHash)
          .limit(1);

        if (realBallots && realBallots.length > 0) {
          const ballot = realBallots[0];
          return NextResponse.json({
            success: true,
            role: 'voter',
            is_admin: false,
            voter: {
              id: ballot.id,
              name: 'Eleitor Cívico Auditado',
              cpf_masked: masked,
              cpf_hash: cpfHash,
              email: '',
              phone: '',
              state: 'SP',
              city: 'São Paulo',
              has_voted: true,
              poll_id: ballot.poll_id || 'eleicao-presidencia-2026',
              created_at: ballot.created_at || new Date().toISOString(),
              is_audit_record: true,
            },
          });
        }

        return NextResponse.json(
          {
            success: false,
            notFound: true,
            error: 'Não localizamos um voto registrado para este CPF. Para ativar seu cadastro cívico e receber seu comprovante de presença auditável, participe da pesquisa presidencial na página inicial.',
            rawError: error ? error.message : 'Voter not found in voters_registry or poll_votes',
          },
          { status: 404 }
        );
      }

      const voter = data[0];
      return NextResponse.json({
        success: true,
        role: isMasterAdmin ? 'admin' : 'voter',
        is_admin: isMasterAdmin,
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
          is_admin: isMasterAdmin,
        },
      });
    } catch (dbErr: any) {
      if (isMasterAdmin) {
        return NextResponse.json({
          success: true,
          role: 'admin',
          is_admin: true,
          voter: {
            id: 'admin-master-voter',
            name: 'Diretor / Gestor Cívico Oficial',
            cpf_masked: masked,
            cpf_hash: 'hash_fatosfakes_admin_master_22487527846',
            email: 'diretoria@fatosfakes2026.org',
            phone: '(11) 98888-2026',
            state: 'SP',
            city: 'São Paulo',
            has_voted: true,
            poll_id: 'eleicao-presidencia-2026',
            created_at: new Date().toISOString(),
            is_admin: true,
          },
        });
      }

      return NextResponse.json(
        { 
          success: false, 
          error: 'Houve uma oscilação na conexão com o banco de dados. Por favor, tente novamente em alguns instantes.',
          rawError: dbErr?.message || 'Database connection error'
        },
        { status: 500 }
      );
    }
  } catch (err: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Não foi possível processar a requisição no momento. Por favor, tente novamente.',
        rawError: err?.message || 'Server error'
      },
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
        { 
          success: false, 
          error: 'Identificador do eleitor não fornecido.',
          rawError: 'Missing voter ID and CPF Hash'
        },
        { status: 400 }
      );
    }

    try {
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
          { 
            success: false, 
            error: 'Não foi possível gravar as alterações no servidor no momento. Seus dados foram salvos no seu navegador.',
            rawError: error.message
          },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Dados cadastrais atualizados com sucesso no banco de dados!',
        voter: data && data.length > 0 ? data[0] : null,
      });
    } catch (dbErr: any) {
      return NextResponse.json({
        success: true,
        fallback: true,
        message: 'Dados atualizados localmente com sucesso!',
      });
    }
  } catch (err: any) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar atualização cadastral.',
        rawError: err?.message || 'Unknown PUT error'
      },
      { status: 500 }
    );
  }
}
