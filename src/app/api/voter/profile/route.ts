import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { validarCPF, mascararCPF } from '@/lib/voteService';

// CPFs com permissão de superusuário / administração da plataforma
const ADMIN_MASTER_CPFS = ['22487527846'];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cpf, adminKey } = body;

    const defaultAdminPass = process.env.ADMIN_PASSWORD || 'admin@fatosfakes2026';

    // 1. Verificação se é login direto por chave administrativa
    if (adminKey && adminKey === defaultAdminPass) {
      return NextResponse.json({
        success: true,
        role: 'admin',
        is_admin: true,
        message: 'Acesso Administrativo autorizado.',
      });
    }

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
    const isMasterAdmin = ADMIN_MASTER_CPFS.includes(cleanCPF);

    try {
      const supabase = getSupabaseAdmin();

      // Busca no banco Supabase na tabela voters_registry
      const { data, error } = await supabase
        .from('voters_registry')
        .select('*')
        .eq('cpf_masked', masked)
        .order('created_at', { ascending: false })
        .limit(1);

      if (error) {
        // Se for o gestor oficial da plataforma, garante acesso imediato mesmo com oscilação da nuvem
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

        let friendlyMessage = 'O serviço de auditoria em nuvem está passando por uma sincronização temporária. Por favor, tente novamente em alguns segundos.';
        if (error.message.includes('schema cache') || error.message.includes('voters_registry') || error.message.includes('relation')) {
          friendlyMessage = 'A infraestrutura de auditoria segura está sendo inicializada na nuvem. Seus dados estão seguros.';
        }

        return NextResponse.json(
          { 
            success: false, 
            error: friendlyMessage,
            rawError: error.message 
          },
          { status: 500 }
        );
      }

      if (!data || data.length === 0) {
        // Se for o gestor oficial da plataforma, cria a sessão de administrador automaticamente
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
            notFound: true,
            error: 'Não localizamos um voto registrado para este CPF. Para ativar seu cadastro cívico e receber seu comprovante de presença auditável, participe da pesquisa presidencial na página inicial.',
            rawError: 'Voter not found in voters_registry',
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
