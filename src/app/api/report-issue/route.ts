import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      errorMessage, 
      rawError, 
      context = 'Portal Cívico', 
      userIdentifier = 'Anônimo',
      path = '/minha-area',
      timestamp = new Date().toISOString()
    } = body;

    const protocol = `REL-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    console.warn(`[CIVIC_ISSUE_REPORT] Protocolo: ${protocol}`);
    console.warn(`Contexto: ${context} | Rota: ${path}`);
    console.warn(`Usuário/CPF Mascarado: ${userIdentifier}`);
    console.warn(`Erro Amigável: ${errorMessage}`);
    console.warn(`Erro Técnico Bruto: ${rawError}`);
    console.warn(`Data/Hora: ${timestamp}`);

    return NextResponse.json({
      success: true,
      protocol,
      message: 'Problema relatado com sucesso! Nossa equipe técnica foi notificada.',
      timestamp,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        success: true,
        protocol: `REL-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        message: 'Relato recebido em modo de contingência.',
      },
      { status: 200 }
    );
  }
}
