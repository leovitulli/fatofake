/**
 * Configuração Central da Chave PIX do FATOS & FAKES
 * 
 * Como editar a sua chave PIX quando decidir:
 * 1. Edite a constante CHAVE_PIX_PADRAO abaixo; OU
 * 2. Adicione a variável de ambiente NEXT_PUBLIC_PIX_KEY no seu arquivo .env.local ou na Vercel.
 */

export const CHAVE_PIX_PADRAO = 'pix@fatosfakes2026.org';

export const PIX_CONFIG = {
  // Chave PIX (lê da env se existir ou usa o padrão para você editar quando quiser)
  chave: process.env.NEXT_PUBLIC_PIX_KEY || CHAVE_PIX_PADRAO,
  tipoChave: 'E-mail / Chave Cadastrada',
  titular: 'FATOS & FAKES · Projeto Cívico Independente',
  instituicao: 'Banco Autorizado pelo Banco Central do Brasil (BACEN)',
  cidade: 'São Paulo / Brasília',
  proposito: 'Manutenção de servidores, banco de dados auditável e apuração cívica 100% independente.',
  
  // Faixas de apoio sugeridas
  faixasSugeridas: [
    { valor: 'R$ 5', descricao: 'Contribui com custos de banco de dados em nuvem' },
    { valor: 'R$ 10', descricao: 'Ajuda a manter apurações e cruzamento de certidões' },
    { valor: 'R$ 20', descricao: 'Financia proteção contra ataques DDoS e estabilidade' },
    { valor: 'R$ 50+', descricao: 'Apoio Mantenedor Cívico da Verdade Política' },
  ],
};
