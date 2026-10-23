import { FactCheck } from '@/types';

export const INITIAL_FACT_CHECKS: FactCheck[] = [
  {
    id: 'chk-tse-urna-offline-2026',
    title: 'Urnas eletrônicas são conectadas à internet ou ao Wi-Fi durante a votação',
    verdict: 'FAKE',
    politician: {
      id: 'tse',
      name: 'Tribunal Superior Eleitoral',
      role: 'Presidente',
      state: 'BR',
      party: 'Justiça Eleitoral',
      photoUrl: '/images/politicians/branco-nulo.svg',
    },
    summary: 'A urna eletrônica é 100% isolada e opera em circuito fechado sem qualquer placa de rede, antena Wi-Fi ou Bluetooth.',
    detailedExplanation: 'O Tribunal Superior Eleitoral (TSE) e peritos de universidades públicas (USP, Unicamp, ITA) e Forças Armadas comprovam anualmente no Teste Público de Segurança (TPS) que a urna opera de forma autônoma. Não possui hardware de rede ou conectividade sem fio, tornando impossível qualquer invasão ou ataque cibernético externo.',
    viralClaim: 'Mensagens no WhatsApp alegavam que urnas eletrônicas recebiam comandos via sinal de celular ou Wi-Fi.',
    sourceAgency: 'TSE Fato ou Boato',
    sourceUrl: 'https://www.tse.jus.br/comunicacao/noticias/fato-ou-boato',
    publishedAt: '2026-03-12',
    category: 'Eleições',
    tags: ['Urna Eletrônica', 'TSE', 'Segurança Eleitoral', 'Fraude', 'Votação']
  },
  {
    id: 'chk-lula-carne-reforma-tributaria',
    title: 'Reforma Tributária criou imposto de 40% sobre carnes bovinas e de aves',
    verdict: 'FAKE',
    politician: {
      id: 'lula',
      name: 'Luiz Inácio Lula da Silva',
      role: 'Presidente',
      state: 'BR',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
    },
    summary: 'Falso. A Lei Complementar da Reforma Tributária incluiu carnes na Cesta Básica Nacional com alíquota zero (isenção total de impostos federais).',
    detailedExplanation: 'Postagens enganosas cortaram discursos de debates no plenário da Câmara dos Deputados para espalhar que alimentos essenciais teriam alíquota de 40%. O texto final sancionado pela Presidência garantiu imposto zero para carnes e itens indispensáveis à alimentação popular.',
    viralPostUrls: [
      { platform: 'Instagram', url: 'https://g1.globo.com/fato-ou-fake/noticia/2024/07/11/e-fake-que-carne-tera-imposto-de-40-apos-reforma-tributaria.ghtml', label: 'Reportagem G1 Fato ou Fake com os vídeos virais analisados' },
      { platform: 'TikTok', url: 'https://lupa.uol.com.br/jornalismo/2024/07/10/reforma-tributaria-carne-cesta-basica/', label: 'Checagem Agência Lupa das postagens virais' }
    ],
    officialProofUrl: {
      name: 'Portal da Câmara dos Deputados - Aprovação da Alíquota Zero para Carnes',
      url: 'https://www.camara.leg.br/noticias/1079375-camara-aprova-texto-base-da-reforma-tributaria-com-carne-na-cesta-basica-isenta/'
    },
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake/noticia/2024/07/11/e-fake-que-carne-tera-imposto-de-40-apos-reforma-tributaria.ghtml',
    publishedAt: '2026-02-18',
    category: 'Economia',
    tags: ['Lula', 'Carne', 'Impostos', 'Reforma Tributária', 'Cesta Básica']
  },
  {
    id: 'chk-lula-isencao-imposto-renda',
    title: 'Governo ampliou a isenção do Imposto de Renda para quem ganha até dois salários mínimos',
    verdict: 'FATO',
    politician: {
      id: 'lula',
      name: 'Luiz Inácio Lula da Silva',
      role: 'Presidente',
      state: 'BR',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
    },
    summary: 'Verdadeiro. Medida Provisória e Lei Federal corrigiram a tabela do IRPF para isentar trabalhadores que recebem até dois salários mínimos mensais.',
    detailedExplanation: 'A Receita Federal confirmou que, com a aplicação do desconto simplificado mensal de R$ 564,80, quem ganha até dois salários mínimos (R$ 2.824) não tem desconto de IRPF no contracheque nem na declaração anual.',
    viralClaim: 'Pronunciamento oficial afirmando que milhões de trabalhadores de menor renda foram isentos do IRPF.',
    sourceAgency: 'Estadão Verifica',
    sourceUrl: 'https://www.estadao.com.br/politica/estadao-verifica',
    publishedAt: '2026-01-20',
    category: 'Economia',
    tags: ['Lula', 'Imposto de Renda', 'IRPF', 'Economia', 'Salário Mínimo']
  },
  {
    id: 'chk-lula-taxacao-pix-5porcento',
    title: 'Banco Central começará a cobrar taxa de 5% sobre transferências feitas por Pix',
    verdict: 'FAKE',
    politician: {
      id: 'lula',
      name: 'Luiz Inácio Lula da Silva',
      role: 'Presidente',
      state: 'BR',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
    },
    summary: 'Mentira. O Banco Central e a Lei do Pix determinam que transferências entre pessoas físicas são permanentemente gratuitas.',
    detailedExplanation: 'A desinformação utilizou regras legítimas do Pix Automático para pagamentos de contas para insinuar que haveria confisco ou tributação direta de 5% sobre qualquer envio de dinheiro entre cidadãos comuns.',
    viralClaim: 'Corrente de WhatsApp alertando que cada Pix enviado descontaria 5% para o Tesouro Nacional.',
    sourceAgency: 'Aos Fatos',
    sourceUrl: 'https://www.aosfatos.org',
    publishedAt: '2026-03-04',
    category: 'Economia',
    tags: ['Lula', 'Pix', 'Banco Central', 'Economia', 'Impostos']
  },
  {
    id: 'chk-tarcisio-privatizacao-sabesp',
    title: 'Conta de água em São Paulo sofreu aumento automático de 30% logo após a privatização da Sabesp',
    verdict: 'ENGANOSO',
    politician: {
      id: 'tarcisio-de-freitas',
      name: 'Tarcísio Gomes de Freitas',
      role: 'Governador',
      state: 'SP',
      party: 'Republicanos',
      photoUrl: '/images/politicians/tarcisio-de-freitas.jpg',
    },
    summary: 'Enganoso. O reajuste ordinário foi autorizado pela agência reguladora independente Arsesp conforme a inflação e o contrato estipulou desconto tarifário para famílias vulneráveis.',
    detailedExplanation: 'O contrato de concessão da Sabesp estabeleceu uma reserva financeira para reduzir tarifas de usuários de baixa renda em até 10%. Aumentos isolados verificados em certas faturas deveram-se a mudanças na média de consumo e faixas de medição predial.',
    viralClaim: 'Fatura de água exibida em vídeo afirmava que a conta dobrou por decisão direta de Tarcísio após o leilão.',
    sourceAgency: 'Agência Lupa',
    sourceUrl: 'https://lupa.uol.com.br',
    publishedAt: '2026-01-25',
    category: 'Leis & Votações',
    tags: ['Tarcísio de Freitas', 'Sabesp', 'São Paulo', 'Privatização', 'Água']
  },
  {
    id: 'chk-tarcisio-cameras-policiais-pm',
    title: 'Governo de São Paulo comprou novos modelos de câmeras corporais com acionamento automático para a Polícia Militar',
    verdict: 'FATO',
    politician: {
      id: 'tarcisio-de-freitas',
      name: 'Tarcísio Gomes de Freitas',
      role: 'Governador',
      state: 'SP',
      party: 'Republicanos',
      photoUrl: '/images/politicians/tarcisio-de-freitas.jpg',
    },
    summary: 'Verdadeiro. A Secretaria de Segurança Pública de SP licitou e contratou 12 mil novas câmeras com geolocalização e gravação acionada por abertura de coldre ou botão de emergência.',
    detailedExplanation: 'Após discussões sobre a continuidade do programa Olho Vivo, a gestão estadual lançou edital internacional que incorporou recursos de transmissão ao vivo de imagem para o Copom e armazenamento em nuvem com custódia de provas.',
    viralClaim: 'Declaração informando a modernização e ampliação dos equipamentos de filmagem nos uniformes da PM paulista.',
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake',
    publishedAt: '2025-12-10',
    category: 'Segurança',
    tags: ['Tarcísio de Freitas', 'Polícia Militar', 'Câmeras Corporais', 'Segurança Pública']
  },
  {
    id: 'chk-zema-salario-almg',
    title: 'Governo de Minas Gerais sancionou aumento de quase 300% no salário do Governador',
    verdict: 'FATO',
    politician: {
      id: 'romeu-zema',
      name: 'Romeu Zema Neto',
      role: 'Governador',
      state: 'MG',
      party: 'NOVO',
      photoUrl: '/images/politicians/romeu-zema.jpg',
    },
    summary: 'Verdadeiro. O Projeto de Lei 415/2023 aprovado na ALMG e sancionado por Zema elevou a remuneração de R$ 10,5 mil para R$ 41,8 mil de forma escalonada.',
    detailedExplanation: 'O reajuste de 298% foi justificado pela gestão para recompor defasagens históricas de 15 anos sem correção e para elevar o teto salarial do funcionalismo estadual (médicos e auditores fiscais), que estavam limitados ao salário do governador.',
    viralClaim: 'Crítica de deputados da oposição afirmando que Zema elevou seu subsídio em quase 300%.',
    sourceAgency: 'Estadão Verifica',
    sourceUrl: 'https://www.estadao.com.br/politica/estadao-verifica',
    publishedAt: '2025-11-14',
    category: 'Leis & Votações',
    tags: ['Romeu Zema', 'Minas Gerais', 'Salário', 'ALMG', 'Economia']
  },
  {
    id: 'chk-nikolas-condenacao-transfobia',
    title: 'Tribunal de Justiça de Minas Gerais condenou Nikolas Ferreira a pagar indenização por fala contra Duda Salabert',
    verdict: 'FATO',
    politician: {
      id: 'nikolas-ferreira',
      name: 'Nikolas Ferreira de Oliveira',
      role: 'Deputado Federal',
      state: 'MG',
      party: 'PL',
      photoUrl: '/images/politicians/nikolas-ferreira.jpg',
    },
    summary: 'Verdadeiro. O TJMG confirmou a condenação civil do parlamentar ao pagamento de R$ 80 mil por danos morais por ofensas transfóbicas em entrevista.',
    detailedExplanation: 'A 5ª Câmara Cível do Tribunal de Justiça de Minas Gerais manteve a decisão de primeira instância, considerando que manifestações discriminatórias não estão albergadas pelo direito constitucional à liberdade de expressão.',
    viralClaim: 'Notícia sobre julgamento da 5ª Câmara Cível que impôs indenização ao deputado federal.',
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake',
    publishedAt: '2024-10-15',
    category: 'Leis & Votações',
    tags: ['Nikolas Ferreira', 'TJMG', 'Justiça', 'Processo', 'Dano Moral']
  },
  {
    id: 'chk-nikolas-bloqueio-contas-stf',
    title: 'STF determinou o bloqueio temporário de perfis de Nikolas Ferreira em redes sociais durante inquérito',
    verdict: 'FATO',
    politician: {
      id: 'nikolas-ferreira',
      name: 'Nikolas Ferreira de Oliveira',
      role: 'Deputado Federal',
      state: 'MG',
      party: 'PL',
      photoUrl: '/images/politicians/nikolas-ferreira.jpg',
    },
    summary: 'Verdadeiro. Decisão do ministro Alexandre de Moraes determinou suspensão temporária de contas do deputado no contexto do Inquérito dos Atos Antidemocráticos.',
    detailedExplanation: 'O ministro do STF apontou a veiculação de conteúdos que questionavam a higidez do processo eleitoral. Posteriormente, após prestação de compromisso e multas recolhidas, as contas foram desbloqueadas.',
    viralClaim: 'Declarações do parlamentar relatando a retenção de suas contas em plataformas como Twitter e Instagram.',
    sourceAgency: 'Estadão Verifica',
    sourceUrl: 'https://www.estadao.com.br/politica/estadao-verifica',
    publishedAt: '2024-04-18',
    category: 'Leis & Votações',
    tags: ['Nikolas Ferreira', 'STF', 'Alexandre de Moraes', 'Redes Sociais', 'Inquérito']
  },
  {
    id: 'chk-nikolas-ferreira-censura-redes',
    title: 'Projeto aprovado na Câmara proíbe cidadãos comuns de criticarem parlamentares na internet',
    verdict: 'FAKE',
    politician: {
      id: 'nikolas-ferreira',
      name: 'Nikolas Ferreira de Oliveira',
      role: 'Deputado Federal',
      state: 'MG',
      party: 'PL',
      photoUrl: '/images/politicians/nikolas-ferreira.jpg',
    },
    summary: 'Falso. Nenhuma lei aprovada criminaliza a crítica política legítima a deputados ou governantes.',
    detailedExplanation: 'Mensagens alarmistas distorceram relatórios sobre responsabilização de empresas de tecnologia por contas falsas robotizadas (bots) para fingir que opiniões pessoais de cidadãos seriam passíveis de prisão imediata.',
    viralClaim: 'Áudio alertava que postar crítica a deputados renderia processo automático e bloqueio de conta bancária.',
    sourceAgency: 'Aos Fatos',
    sourceUrl: 'https://www.aosfatos.org',
    publishedAt: '2026-02-05',
    category: 'Leis & Votações',
    tags: ['Nikolas Ferreira', 'Liberdade de Expressão', 'Câmara dos Deputados', 'Redes Sociais']
  },
  {
    id: 'chk-pacheco-impeachment-stf',
    title: 'Presidente do Senado Rodrigo Pacheco foi obrigado pelo STF a abrir processo contra ministro',
    verdict: 'FAKE',
    politician: {
      id: 'rodrigo-pacheco',
      name: 'Rodrigo Otavio Soares Pacheco',
      role: 'Senador',
      state: 'MG',
      party: 'PSD',
      photoUrl: '/images/politicians/rodrigo-pacheco.jpg',
    },
    summary: 'Falso. A Constituição Brasileira estabelece que a abertura de processo de impeachment contra ministro do STF é prerrogativa discricionária do Presidente do Senado.',
    detailedExplanation: 'O Supremo Tribunal Federal reiterou sua jurisprudência no sentido de que o Judiciário não pode interferir no mérito ou no tempo político da presidência do Senado para o recebimento de pedidos de destituição de ministros.',
    viralClaim: 'Vídeo no YouTube com título chamativo "Urgente: STF enquadra Pacheco e manda pautar impeachment em 48h".',
    sourceAgency: 'UOL Confere',
    sourceUrl: 'https://noticias.uol.com.br/confere',
    publishedAt: '2026-03-01',
    category: 'Leis & Votações',
    tags: ['Rodrigo Pacheco', 'Senado Federal', 'STF', 'Impeachment', 'Constituição']
  },
  {
    id: 'chk-tabata-pobreza-menstrual',
    title: 'Programa de distribuição gratuita de absorventes no SUS é lei federal em vigor no Brasil',
    verdict: 'FATO',
    politician: {
      id: 'tabata-amaral',
      name: 'Tabata Claudia Amaral de Pontes',
      role: 'Deputado Federal',
      state: 'SP',
      party: 'PSB',
      photoUrl: '/images/politicians/tabata-amaral.jpg',
    },
    summary: 'Verdadeiro. O Programa de Proteção e Promoção da Saúde Menstrual (Lei 14.214), coautoria de Tabata Amaral, atende mais de 8 milhões de mulheres no SUS.',
    detailedExplanation: 'A distribuição é realizada por meio do programa Farmácia Popular e postos de saúde de todo o país para mulheres entre 10 e 49 anos inscritas no CadÚnico ou matriculadas em escolas públicas.',
    viralClaim: 'Declaração afirmando que a distribuição de absorventes no SUS é um direito garantido por lei federal em funcionamento.',
    sourceAgency: 'Agência Lupa',
    sourceUrl: 'https://lupa.uol.com.br',
    publishedAt: '2026-01-10',
    category: 'Saúde',
    tags: ['Tabata Amaral', 'Saúde', 'Câmara dos Deputados', 'SUS', 'Lei']
  },
  {
    id: 'chk-arthur-lira-emendas-pix',
    title: 'Emendas Pix podem ser pagas pelo Governo Federal sem registro de beneficiário ou transparência',
    verdict: 'ENGANOSO',
    politician: {
      id: 'arthur-lira',
      name: 'Arthur César Pereira de Lira',
      role: 'Deputado Federal',
      state: 'AL',
      party: 'PP',
      photoUrl: '/images/politicians/arthur-lira.jpg',
    },
    summary: 'Enganoso. Após decisões do STF e nova regulamentação entre os Poderes, as transferências especiais passaram a exigir indicação prévia e controle pelo TCU.',
    detailedExplanation: 'As emendas de transferência especial anteriormente não possuíam vinculação obrigatória de convênio. Com a edição da Lei Complementar aprovada pelo Congresso em 2024, passou a ser compulsório o cadastro no sistema TransfereGov e acompanhamento do Tribunal de Contas da União.',
    viralClaim: 'Postagens afirmavam que bilhões em verbas públicas estavam sendo transferidos via Pix sem qualquer registro de quem recebeu.',
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake',
    publishedAt: '2026-02-28',
    category: 'Economia',
    tags: ['Arthur Lira', 'Emendas Pix', 'Orçamento', 'Transparência', 'Congresso']
  },
  {
    id: 'chk-boulos-desapropriacao-casas',
    title: 'Guilherme Boulos propôs projeto de lei para desapropriar imóveis quitados de famílias de classe média',
    verdict: 'FAKE',
    politician: {
      id: 'guilherme-boulos',
      name: 'Guilherme Castro Boulos',
      role: 'Deputado Federal',
      state: 'SP',
      party: 'PSOL',
      photoUrl: '/images/politicians/guilherme-boulos.jpg',
    },
    summary: 'Falso. A Constituição e o Estatuto da Cidade regulam a função social da propriedade exclusivamente para imóveis abandonados com dívidas ativas milionárias.',
    detailedExplanation: 'Postagens em grupos políticos sustentavam que qualquer residência com cômodos não ocupados poderia ser tomada pelo poder público. O parlamentar nunca apresentou proposta nesse sentido e o direito à propriedade particular é cláusula pétrea constitucional.',
    viralClaim: 'Imagem adulterada no WhatsApp simulando reportagem do portal de notícias anunciando expropriação de casas.',
    sourceAgency: 'Estadão Verifica',
    sourceUrl: 'https://www.estadao.com.br/politica/estadao-verifica',
    publishedAt: '2025-09-22',
    category: 'Habitação',
    tags: ['Guilherme Boulos', 'Habitação', 'Propriedade Privada', 'Desinformação']
  },
  {
    id: 'chk-caiado-ideb-educacao',
    title: 'Rede estadual de ensino de Goiás alcançou a primeira posição nacional no Ideb do Ensino Médio',
    verdict: 'FATO',
    politician: {
      id: 'ronaldo-caiado',
      name: 'Ronaldo Ramos Caiado',
      role: 'Governador',
      state: 'GO',
      party: 'União Brasil',
      photoUrl: '/images/politicians/ronaldo-caiado.jpg',
    },
    summary: 'Verdadeiro. Dados oficiais divulgados pelo Ministério da Educação e pelo Inep colocaram a rede pública de Goiás no topo do índice nacional.',
    detailedExplanation: 'O Índice de Desenvolvimento da Educação Básica (Ideb) registrou nota 4,8 para a rede estadual goiana no ensino médio, superando as médias de todos os demais estados da federação.',
    viralClaim: 'Propaganda institucional do governo de Goiás afirmando que o estado lidera a educação pública no país.',
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake',
    publishedAt: '2024-08-16',
    category: 'Educação',
    tags: ['Ronaldo Caiado', 'Goiás', 'Ideb', 'Educação', 'MEC']
  },
  {
    id: 'chk-cleitinho-taxa-blusinhas',
    title: 'Senador Cleitinho votou contra o projeto de taxação de compras internacionais de até US$ 50',
    verdict: 'FATO',
    politician: {
      id: 'cleitinho',
      name: 'Cleiton Gontijo de Azevedo',
      role: 'Senador',
      state: 'MG',
      party: 'Republicanos',
      photoUrl: '/images/politicians/cleitinho.jpg',
    },
    summary: 'Verdadeiro. O senador manifestou voto contrário no plenário do Senado Federal à volta do imposto de importação sobre compras de baixo valor.',
    detailedExplanation: 'Durante a votação da matéria vinculada ao Programa Mover, o senador mineiro discursou em plenário sustentando que a medida onerava desproporcionalmente o consumidor de menor poder aquisitivo e registrou voto contrário.',
    viralClaim: 'Vídeo nas redes sociais mostrando o voto do parlamentar no painel eletrônico do Senado.',
    sourceAgency: 'Senado Notícias / UOL Confere',
    sourceUrl: 'https://noticias.uol.com.br/confere',
    publishedAt: '2024-06-06',
    category: 'Economia',
    tags: ['Cleitinho', 'Senado Federal', 'Taxa das Blusinhas', 'Impostos', 'Importação']
  },
  {
    id: 'chk-flavio-48-depositos-especie-alerj',
    title: 'Flávio Bolsonaro recebeu 48 depósitos em dinheiro de R$ 2 mil no caixa eletrônico da Alerj',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Relatório oficial do Coaf identificou 48 depósitos em espécie de R$ 2 mil cada, totalizando R$ 96 mil, creditados na conta do senador em apenas 5 dias em 2017.',
    detailedExplanation: 'Conforme relatório de inteligência financeira do Coaf enviado ao Ministério Público do Rio de Janeiro, entre junho e julho de 2017 foram efetuados 48 depósitos de R$ 2 mil cada, concentrados em poucos minutos no autoatendimento do posto bancário da Alerj, além de pagamento de título de R$ 1,016 milhão. O senador confirmou os depósitos à época, afirmando que decorriam da venda de um imóvel em Laranjeiras, embora reportagens e a investigação tenham apontado divergências de datas com a escritura. O processo criminal correlato foi posteriormente extinto após anulação judicial das provas pelo STJ.',
    viralClaim: 'Reportagens e publicações em redes sociais afirmando que Flávio Bolsonaro recebeu dezenas de depósitos fracionados de R$ 2 mil em dinheiro vivo na Alerj.',
    viralPostUrls: [
      { platform: 'G1 / TV Globo', url: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/coaf-aponta-48-depositos-suspeitos-em-conta-de-flavio-bolsonaro-diz-jornal-nacional.ghtml', label: 'Reportagem Original do Jornal Nacional / Coaf' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=coaf+48+depositos+flavio+bolsonaro+jornal+nacional', label: 'Matéria Audiovisual no YouTube' }
    ],
    officialProofUrl: {
      name: 'Relatório Oficial de Inteligência Financeira do Coaf (Alerj)',
      url: 'https://transparencia.mprj.mp.br'
    },
    sources: [
      {
        name: 'G1 Jornal Nacional - Reportagem Investigativa Coaf',
        url: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/coaf-aponta-48-depositos-suspeitos-em-conta-de-flavio-bolsonaro-diz-jornal-nacional.ghtml',
        type: 'agencia'
      },
      {
        name: 'Transparência MPRJ - Procedimento Investigatório Criminal',
        url: 'https://transparencia.mprj.mp.br',
        type: 'documento_oficial'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Flavio+Bolsonaro+48+depositos+Coaf',
        type: 'auditoria_aberta'
      },
      {
        name: 'Google Notícias - Cobertura de Imprensa Consolidada',
        url: 'https://news.google.com/search?q=Flavio+Bolsonaro+48+depositos+Coaf',
        type: 'imprensa'
      }
    ],
    sourceAgency: 'G1 / Estadão Verifica / Agência Brasil',
    sourceUrl: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2019/01/18/coaf-aponta-48-depositos-suspeitos-em-conta-de-flavio-bolsonaro-diz-jornal-nacional.ghtml',
    publishedAt: '2026-10-18',
    category: 'Declarações',
    tags: ['Flávio Bolsonaro', 'Alerj', 'Coaf', 'Rachadinha', 'Depósitos', 'Fabrício Queiroz', 'Dinheiro Vivo']
  },
  {
    id: 'chk-bolsonaro-51-imoveis-dinheiro-vivo',
    title: 'Família Bolsonaro adquiriu 51 imóveis com pagamento registrado em dinheiro vivo entre 1990 e 2022',
    verdict: 'FATO',
    politician: {
      id: 'jair-bolsonaro',
      name: 'Jair Messias Bolsonaro',
      role: 'Presidente',
      state: 'BR',
      party: 'PL',
      photoUrl: '/images/politicians/jair-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Levantamento documental em cartórios de notas e registros de imóveis pelo portal UOL comprovou que quase metade do patrimônio imobiliário familiar foi quitado em moeda corrente nacional em espécie.',
    detailedExplanation: 'Investigação jornalística de 7 meses conduzida pelo portal UOL consultou escrituras públicas de 107 transações imobiliárias realizadas por Jair Bolsonaro, seus três filhos mais velhos (Flávio, Carlos e Eduardo), mãe e irmãos ao longo de três décadas. Os documentos cartoriais atestam textualmente que 51 imóveis foram pagos no todo ou em parte em "moeda corrente", somando R$ 25,6 milhões em valores corrigidos. A defesa e o ex-presidente sustentaram que a expressão cartorial "moeda corrente" refere-se a reais e não obrigatoriamente a notas de dinheiro vivo, embora os tabeliães consultados tenham confirmado que o termo diferencia transações em cédulas daquelas feitas por cheque ou transferência bancária.',
    viralClaim: 'Reportagem investigativa do UOL afirmando que o clã Bolsonaro comprou 51 imóveis com dinheiro em espécie.',
    viralPostUrls: [
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=51+imoveis+dinheiro+vivo+bolsonaro+uol', label: 'Reportagem em vídeo no YouTube' },
      { platform: 'UOL Notícias', url: 'https://noticias.uol.com.br/politica/ultimas-noticias/2022/08/30/patrimonio-familia-bolsonaro-imoveis-dinheiro-vivo.htm', label: 'Dossiê Completo das Escrituras no UOL' }
    ],
    officialProofUrl: {
      name: 'Escrituras Públicas nos Cartórios de Notas do RJ e SP',
      url: 'https://noticias.uol.com.br/politica/ultimas-noticias/2022/08/30/patrimonio-familia-bolsonaro-imoveis-dinheiro-vivo.htm'
    },
    sources: [
      {
        name: 'UOL Notícias - Investigação Cartorial 51 Imóveis',
        url: 'https://noticias.uol.com.br/politica/ultimas-noticias/2022/08/30/patrimonio-familia-bolsonaro-imoveis-dinheiro-vivo.htm',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Bolsonaro+51+imoveis+dinheiro+vivo',
        type: 'auditoria_aberta'
      },
      {
        name: 'Google Notícias - Repercussão e Cartórios de Notas',
        url: 'https://news.google.com/search?q=Bolsonaro+51+imoveis+dinheiro+vivo+cartorios',
        type: 'imprensa'
      }
    ],
    sourceAgency: 'UOL Confere',
    sourceUrl: 'https://noticias.uol.com.br/politica/ultimas-noticias/2022/08/30/patrimonio-familia-bolsonaro-imoveis-dinheiro-vivo.htm',
    publishedAt: '2022-08-30',
    category: 'Declarações',
    tags: ['Jair Bolsonaro', 'Flávio Bolsonaro', 'Imóveis', 'Dinheiro Vivo', 'Cartório', 'UOL', 'Patrimônio']
  },
  {
    id: 'chk-queiroz-preso-casa-wassef-atibaia',
    title: 'Fabrício Queiroz foi localizado e preso pela polícia em imóvel do advogado da família Bolsonaro em Atibaia',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Em junho de 2020, o ex-assessor parlamentar Fabrício Queiroz foi detido pela Polícia Civil e MPRJ na residência do advogado Frederick Wassef no interior paulista.',
    detailedExplanation: 'A Operação Anjo, deflagrada pelo Ministério Público do Rio de Janeiro com apoio da Polícia Civil de São Paulo em 18 de junho de 2020, cumpriu mandado de prisão preventiva contra Fabrício Queiroz no imóvel de Frederick Wassef, advogado que atuava na defesa de Flávio Bolsonaro e Jair Bolsonaro. Dias antes, Wassef havia declarado publicamente não saber o paradeiro de Queiroz. Posteriormente, a defesa alegou que o ex-assessor foi acolhido por razões humanitárias para tratamento médico e não com a finalidade de ocultação de investigado.',
    viralClaim: 'Informação de que o operador financeiro da Alerj estava foragido e foi encontrado no imóvel de veraneio do advogado em Atibaia.',
    viralPostUrls: [
      { platform: 'G1 Notícias', url: 'https://g1.globo.com/sp/vale-do-paraiba-regiao/noticia/2020/06/18/fabricio-queiroz-e-preso-em-atibaia-sp.ghtml', label: 'Reportagem G1 e vídeo da prisão em Atibaia' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=fabricio+queiroz+preso+atibaia+wassef', label: 'Vídeo da operação policial' }
    ],
    officialProofUrl: {
      name: 'Mandado Judicial de Prisão - Operação Anjo / MPRJ',
      url: 'https://transparencia.mprj.mp.br'
    },
    sources: [
      {
        name: 'G1 Fato ou Fake - Prisão de Queiroz em Atibaia',
        url: 'https://g1.globo.com/sp/vale-do-paraiba-regiao/noticia/2020/06/18/fabricio-queiroz-e-preso-em-atibaia-sp.ghtml',
        type: 'agencia'
      },
      {
        name: 'MPRJ - Operação Anjo e Mandado de Prisão Preventiva',
        url: 'https://transparencia.mprj.mp.br',
        type: 'documento_oficial'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Fabricio+Queiroz+preso+casa+Wassef+Atibaia',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'G1 Fato ou Fake',
    sourceUrl: 'https://g1.globo.com/sp/vale-do-paraiba-regiao/noticia/2020/06/18/fabricio-queiroz-e-preso-em-atibaia-sp.ghtml',
    publishedAt: '2020-06-18',
    category: 'Declarações',
    tags: ['Flávio Bolsonaro', 'Fabrício Queiroz', 'Frederick Wassef', 'Atibaia', 'Rachadinha', 'Operação Anjo']
  },
  {
    id: 'chk-flavio-kopenhagen-chocolates-mprj',
    title: 'Franquia de chocolates de Flávio Bolsonaro no Via Parque teve movimentação atípica em espécie apontada pelo MPRJ',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. O Ministério Público do Rio documentou na denúncia 1.512 depósitos em dinheiro vivo que somaram R$ 1,6 milhão na conta da franquia de chocolates de Flávio.',
    detailedExplanation: 'A denúncia do Ministério Público estadual detalhou que a franquia de chocolates Kopenhagen no Shopping Via Parque, na Barra da Tijuca, registrou depósitos em dinheiro vivo desproporcionais ao faturamento médio de outras lojas da mesma rede no Rio, configurando indício de lavagem de recursos da Alerj. A defesa afirmou que o comércio de doces e presentes tem alto fluxo natural de pagamentos em cédulas e que todas as operações contábeis foram declaradas à Receita Federal. O processo penal foi trancado pelo TJ-RJ após o STJ anular as provas periciais originadas da 1ª instância.',
    viralClaim: 'Denúncia de que a loja de chocolates do senador funcionava como entreposto para lavagem de dinheiro da rachadinha.',
    viralPostUrls: [
      { platform: 'G1 Rio', url: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2020/11/04/denuncia-do-mp-detalha-esquema-de-rachadinha-e-lavagem-de-dinheiro-na-loja-de-chocolates-de-flavio-bolsonaro.ghtml', label: 'Reportagem Investigativa da Loja de Chocolates' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=loja+de+chocolates+flavio+bolsonaro+mprj', label: 'Matérias em vídeo no YouTube' }
    ],
    officialProofUrl: {
      name: 'Denúncia Criminal do MPRJ - TJ-RJ (Autos da Alerj)',
      url: 'https://transparencia.mprj.mp.br'
    },
    sources: [
      {
        name: 'G1 Rio / JN - Denúncia do MPRJ sobre Loja de Chocolates',
        url: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2020/11/04/denuncia-do-mp-detalha-esquema-de-rachadinha-e-lavagem-de-dinheiro-na-loja-de-chocolates-de-flavio-bolsonaro.ghtml',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Flavio+Bolsonaro+chocolates+Kopenhagen+MPRJ',
        type: 'auditoria_aberta'
      },
      {
        name: 'Google Notícias - Cobertura de Imprensa',
        url: 'https://news.google.com/search?q=Flavio+Bolsonaro+chocolates+Kopenhagen+MPRJ',
        type: 'imprensa'
      }
    ],
    sourceAgency: 'G1 / Aos Fatos',
    sourceUrl: 'https://g1.globo.com/rj/rio-de-janeiro/noticia/2020/11/04/denuncia-do-mp-detalha-esquema-de-rachadinha-e-lavagem-de-dinheiro-na-loja-de-chocolates-de-flavio-bolsonaro.ghtml',
    publishedAt: '2022-05-18',
    category: 'Economia',
    tags: ['Flávio Bolsonaro', 'Kopenhagen', 'Lavagem de Dinheiro', 'MPRJ', 'Alerj', 'Chocolates']
  },
  {
    id: 'chk-flavio-medalha-adriano-nobrega-prisao',
    title: 'Flávio Bolsonaro concedeu a Medalha Tiradentes ao capitão Adriano da Nóbrega enquanto ele estava preso',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Resolução oficial da Alerj de 2005 comprova a concessão da Medalha Tiradentes, maior honraria do estado, quando o policial militar já estava preso preventivamente.',
    detailedExplanation: 'Em junho de 2005, por iniciativa do então deputado estadual Flávio Bolsonaro, a Assembleia Legislativa do Rio de Janeiro aprovou a entrega da Medalha Tiradentes ao capitão da PM Adriano Magalhães da Nóbrega, que se encontrava detido no Batalhão Prisional acusado de homicídio. Além da honraria, a mãe e a ex-esposa de Adriano constaram como assessoras lotadas no gabinete parlamentar de Flávio na Alerj. Anos mais tarde, Adriano da Nóbrega foi apontado pelo Ministério Público como líder do grupo "Escritório do Crime". O senador explicou que à época homenageou o policial em razão de operações no Bope e que não poderia prever condutas futuras.',
    viralClaim: 'Postagens afirmando que Flávio condecorou miliciano do Escritório do Crime dentro do presídio.',
    viralPostUrls: [
      { platform: 'X', url: 'https://x.com/search?q=flavio%20bolsonaro%20medalha%20tiradentes%20adriano%20nobrega', label: 'Documentos e posts no X / Twitter' }
    ],
    officialProofUrl: {
      name: 'Resolução 931/2005 da Assembleia Legislativa do Rio de Janeiro (Alerj)',
      url: 'https://alerjln1.alerj.rj.gov.br'
    },
    sources: [
      {
        name: 'Alerj - Diário Oficial e Resolução 931/2005',
        url: 'https://alerjln1.alerj.rj.gov.br',
        type: 'documento_oficial'
      },
      {
        name: 'Agência Lupa - Checagem Oficial Concessão da Medalha',
        url: 'https://lupa.uol.com.br',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Flavio+Bolsonaro+Medalha+Tiradentes+Adriano+Nobrega',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'Agência Lupa',
    sourceUrl: 'https://lupa.uol.com.br',
    publishedAt: '2026-10-19',
    category: 'Declarações',
    tags: ['Flávio Bolsonaro', 'Adriano da Nóbrega', 'Medalha Tiradentes', 'Alerj', 'Milícia', 'Escritório do Crime']
  },
  {
    id: 'chk-flavio-banco-master-dark-horse',
    title: 'Repasses de controlador do Banco Master financiaram o filme Dark Horse sobre Bolsonaro via fundo nos EUA',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Documentos contábeis e depoimentos confirmaram repasses de ao menos R$ 61 milhões ligados a Daniel Vorcaro ao fundo Havengate para o filme sobre Jair Bolsonaro.',
    detailedExplanation: 'Investigação da Polícia Federal no STF e reportagens investigativas de veículos jornalísticos (G1, Piauí, Intercept e R7) revelaram que o controlador do Banco Master, Daniel Vorcaro, viabilizou mais de R$ 61 milhões para a produção do documentário "Dark Horse" através do Havengate Development Fund, no Texas, sem registro de contrato nos balanços oficiais do banco. Flávio Bolsonaro articulou o projeto com a produtora e declarou que a produção cinematográfica era uma iniciativa cultural privada e que não cometeu qualquer irregularidade ou tráfico de influência institucional.',
    viralClaim: 'Reportagens do Jornal Nacional e portais de notícias sobre recursos milionários aportados pelo Banco Master para filme da família Bolsonaro.',
    viralPostUrls: [
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=dark+horse+banco+master+jornal+nacional', label: 'Reportagem no Jornal Nacional' },
      { platform: 'X', url: 'https://x.com/search?q=dark%20horse%20banco%20master%20vorcaro', label: 'Posts no X / Twitter' }
    ],
    officialProofUrl: {
      name: 'Inquérito no Supremo Tribunal Federal & Havengate Fund (Texas)',
      url: 'https://portal.stf.jus.br'
    },
    sources: [
      {
        name: 'G1 Jornal Nacional - Dossiê Pagamentos Banco Master Dark Horse',
        url: 'https://g1.globo.com/jornal-nacional/noticia/2026/09/12/dark-horse-documentos-analisados-pela-pf-mostram-pagamentos-do-banco-master-para-o-filme.ghtml',
        type: 'agencia'
      },
      {
        name: 'Supremo Tribunal Federal - Autos e Documentação Pericial PF',
        url: 'https://portal.stf.jus.br',
        type: 'tribunal'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Dark+Horse+Banco+Master+Flavio+Bolsonaro',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'G1 Fato ou Fake / UOL Confere',
    sourceUrl: 'https://g1.globo.com/jornal-nacional/noticia/2026/09/12/dark-horse-documentos-analisados-pela-pf-mostram-pagamentos-do-banco-master-para-o-filme.ghtml',
    publishedAt: '2026-09-12',
    category: 'Economia',
    tags: ['Flávio Bolsonaro', 'Jair Bolsonaro', 'Banco Master', 'Dark Horse', 'Vorcaro', 'STF', 'Tarussa', 'Havengate']
  },
  {
    id: 'chk-flavio-mansao-brasilia-brb',
    title: 'Flávio Bolsonaro comprou mansão de quase R$ 6 milhões em Brasília com financiamento a taxa de 3,71% no BRB',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. Escritura pública e certidão de registro atestam a compra do imóvel no Lago Sul por R$ 5,97 milhões com financiamento de R$ 3,1 milhões pelo BRB.',
    detailedExplanation: 'A certidão do 1º Ofício de Registro de Imóveis do DF confirma que Flávio e sua esposa adquiriram a mansão no setor de Mansões Filadélfia por R$ 5.970.000, com R$ 3,1 milhões financiados pelo Banco de Brasília com taxa de juros de 3,71% ao ano, quitado em apenas 3 anos. A Polícia Federal e auditoria interna do banco apuram se a taxa concedida foi compatível com o perfil do cliente e política de crédito da instituição. O parlamentar reiterou que cumpriu todos os critérios objetivos de renda e prestou esclarecimentos aos órgãos fiscalizadores.',
    viralClaim: 'Informações sobre a compra da mansão de luxo no Lago Sul e o crédito imobiliário do banco estatal de Brasília.',
    viralPostUrls: [
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=mansao+flavio+bolsonaro+brb+brasilia', label: 'Imagens da mansão no YouTube' },
      { platform: 'X', url: 'https://x.com/search?q=mansao%20flavio%20bolsonaro%20brb', label: 'Posts no X / Twitter' }
    ],
    officialProofUrl: {
      name: 'Certidão do 1º Ofício de Registro de Imóveis do Distrito Federal',
      url: 'https://www.brb.com.br'
    },
    sources: [
      {
        name: 'Estadão Verifica - Registro e Financiamento da Mansão',
        url: 'https://www.estadao.com.br/politica/estadao-verifica',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Flavio+Bolsonaro+mansao+Brasilia+BRB',
        type: 'auditoria_aberta'
      },
      {
        name: 'Google Notícias - Investigação e Certidões de Registro',
        url: 'https://news.google.com/search?q=Flavio+Bolsonaro+mansao+Brasilia+BRB',
        type: 'imprensa'
      }
    ],
    sourceAgency: 'Estadão Verifica',
    sourceUrl: 'https://www.estadao.com.br/politica/estadao-verifica',
    publishedAt: '2026-10-16',
    category: 'Economia',
    tags: ['Flávio Bolsonaro', 'Mansão', 'BRB', 'Lago Sul', 'Financiamento', 'Patrimônio']
  },
  {
    id: 'chk-flavio-richarlison-ilha-angra',
    title: 'Jogador Richarlison acusou grupo ligado a Flávio Bolsonaro de tomar posse de mansão de R$ 10 milhões em Angra dos Reis',
    verdict: 'FATO',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. O atacante da Seleção Brasileira e do Tottenham acionou a Polícia Federal contra processo de regularização que transferiu o imóvel à empresa de Willer Tomaz.',
    detailedExplanation: 'O jogador de futebol Richarlison protocolou representação na Polícia Federal em outubro de 2026 sustentando que adquiriu e reformou propriedade na Ilha Comprida em Angra dos Reis por R$ 10 milhões, mas teve a posse retirada em disputa administrativa perante a Secretaria do Patrimônio da União (SPU) favorável à empresa do advogado Willer Tomaz, amigo próximo de Flávio Bolsonaro. O senador negou veementemente qualquer participação na disputa patrimonial e afirmou nunca ter tido interesse no referido imóvel, cuja disputa judicial foi decidida em favor de Tomaz.',
    viralClaim: 'Declaração pública do atacante Richarlison pedindo investigação da PF contra o senador Flávio Bolsonaro.',
    sources: [
      {
        name: 'Folha de S.Paulo - Representação na Polícia Federal por Richarlison',
        url: 'https://www1.folha.uol.com.br/esporte/2026/10/richarlison-apresenta-documentos-de-compra-de-propriedade-em-disputa-com-flavio-bolsonaro.shtml',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Richarlison+Flavio+Bolsonaro+Angra+dos+Reis+mansao',
        type: 'auditoria_aberta'
      },
      {
        name: 'Google Notícias - Cobertura de Imprensa Consolidada',
        url: 'https://news.google.com/search?q=Richarlison+Flavio+Bolsonaro+Angra+dos+Reis',
        type: 'imprensa'
      }
    ],
    sourceAgency: 'Folha de S.Paulo / UOL Confere',
    sourceUrl: 'https://www1.folha.uol.com.br/esporte/2026/10/richarlison-apresenta-documentos-de-compra-de-propriedade-em-disputa-com-flavio-bolsonaro.shtml',
    publishedAt: '2026-10-21',
    category: 'Declarações',
    tags: ['Flávio Bolsonaro', 'Richarlison', 'Angra dos Reis', 'Willer Tomaz', 'SPU', 'Ilha Comprida']
  },
  {
    id: 'chk-fake-flavio-condenado-prisao-rachadinha',
    title: 'Flávio Bolsonaro foi condenado a 12 anos de prisão em regime fechado pelo caso da rachadinha na Alerj',
    verdict: 'FAKE',
    politician: {
      id: 'flavio-bolsonaro',
      name: 'Flávio Nantes Bolsonaro',
      role: 'Senador',
      state: 'RJ',
      party: 'PL',
      photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
    },
    summary: 'Falso. O senador nunca foi condenado criminalmente pelo caso da rachadinha; o processo criminal foi encerrado pelo TJ-RJ sem julgamento de mérito após o STJ anular as provas.',
    detailedExplanation: 'Circulam na internet boatos enganosos alegando que Flávio Bolsonaro teria sido sentenciado a regime fechado de prisão. Na realidade, a 3ª Câmara Criminal do TJ-RJ rejeitou a denúncia do Ministério Público em 16 de maio de 2022 por ausência de justa causa após decisões vinculantes do STJ e do STF que reconheceram vícios formais nas decisões de quebra de sigilo da 1ª instância. O parlamentar é ficha limpa e não possui nenhuma condenação penal definitiva.',
    viralClaim: 'Montagem com manchete falsa dizendo "Urgente: Justiça condena Flávio Bolsonaro à prisão imediata".',
    officialProofUrl: {
      name: 'Decisão da 3ª Câmara Criminal do TJ-RJ (Trancamento da Ação)',
      url: 'https://www.tjrj.jus.br'
    },
    sources: [
      {
        name: 'Agência Lupa - Falso que Flávio Bolsonaro foi condenado à prisão',
        url: 'https://lupa.uol.com.br',
        type: 'agencia'
      },
      {
        name: 'Tribunal de Justiça do Rio de Janeiro (TJ-RJ) - Certidão Criminal',
        url: 'https://www.tjrj.jus.br',
        type: 'tribunal'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Flavio+Bolsonaro+condenado+prisao+rachadinha+fake',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'Agência Lupa / Estadão Verifica',
    sourceUrl: 'https://lupa.uol.com.br',
    publishedAt: '2026-10-18',
    category: 'Leis & Votações',
    tags: ['Flávio Bolsonaro', 'Rachadinha', 'Condenação', 'Justiça', 'Fake News', 'Ficha Limpa']
  },
  {
    id: 'chk-lula-mensalao-ap-470',
    title: 'Lula foi réu ou condenado à prisão pelo STF no processo do Mensalão',
    verdict: 'FAKE',
    politician: {
      id: 'lula',
      name: 'Luiz Inácio Lula da Silva',
      role: 'Presidente',
      state: 'BR',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
    },
    summary: 'Falso. Lula nunca foi denunciado, réu ou condenado na Ação Penal 470 (Mensalão) pelo Supremo Tribunal Federal.',
    detailedExplanation: 'Na denúncia apresentada em 2006 pelo então Procurador-Geral da República, Antonio Fernando de Souza, perante o STF, o presidente Lula não foi denunciado e não constou no rol dos 40 réus da Ação Penal 470. O julgamento do STF em 2012 condenou 25 pessoas (incluindo José Dirceu, José Genoino, Delúbio Soares e Marcos Valério), mas sem nenhuma acusação ou condenação contra Lula. Em 2019, na denúncia do "Quadrilhão do PT", a 12ª Vara Federal de Brasília absolveu sumariamente Lula por inexistência de provas.',
    viralClaim: 'Boato recorrente em correntes de WhatsApp e vídeos nas redes alegando que Lula teria sido condenado no Mensalão e "escapou da prisão".',
    viralPostUrls: [
      { platform: 'G1 Notícias', url: 'https://g1.globo.com/fato-ou-fake/noticia/2022/09/14/e-fato-ou-fake-que-lula-foi-condenado-no-mensalao.ghtml', label: 'Checagem Oficial G1 Fato ou Fake' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=lula+foi+condenado+no+mensalao+fato+ou+fake', label: 'Vídeo da checagem' }
    ],
    officialProofUrl: {
      name: 'Acórdão do STF - Ação Penal 470 (Rol de Réus do Mensalão)',
      url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=2388704'
    },
    sources: [
      {
        name: 'G1 Fato ou Fake - Lula nunca foi condenado no Mensalão',
        url: 'https://g1.globo.com/fato-ou-fake/noticia/2022/09/14/e-fato-ou-fake-que-lula-foi-condenado-no-mensalao.ghtml',
        type: 'agencia'
      },
      {
        name: 'Supremo Tribunal Federal - Autos da Ação Penal 470',
        url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=2388704',
        type: 'tribunal'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Lula+condenado+Mensalao+AP+470',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'G1 Fato ou Fake / Aos Fatos',
    sourceUrl: 'https://g1.globo.com/fato-ou-fake/noticia/2022/09/14/e-fato-ou-fake-que-lula-foi-condenado-no-mensalao.ghtml',
    publishedAt: '2022-09-14',
    category: 'Eleições',
    tags: ['Lula', 'Mensalão', 'AP 470', 'STF', 'José Dirceu', 'Marcos Valério', 'Condenação', 'Fato ou Fake']
  },
  {
    id: 'chk-lula-lava-jato-anulacao-stf',
    title: 'Lula foi condenado na Lava Jato e continua impedido de disputar eleições',
    verdict: 'ENGANOSO',
    politician: {
      id: 'lula',
      name: 'Luiz Inácio Lula da Silva',
      role: 'Presidente',
      state: 'BR',
      party: 'PT',
      photoUrl: '/images/politicians/lula.jpg',
    },
    summary: 'Enganoso. Lula foi condenado em 2017/2018 na 1ª e 2ª instâncias de Curitiba, mas todas as condenações foram anuladas pelo Plenário do STF em 2021 por incompetência de foro e suspeição do juiz Sergio Moro.',
    detailedExplanation: 'Lula foi condenado na 13ª Vara Federal de Curitiba e pelo TRF-4 nos processos do Triplex do Guarujá e do Sítio de Atibaia, cumprindo 580 dias de prisão. Contudo, em 2021, o Plenário do Supremo Tribunal Federal concluiu no HC 193.726 que a Justiça Federal do Paraná era incompetente para o julgamento e, no HC 164.493, a 2ª Turma declarou a parcialidade e suspeição do ex-juiz Sergio Moro. Em razão das decisões da Suprema Corte, as condenações foram invalidadas desde a raiz, os processos foram extintos e Lula recuperou todos os direitos políticos, elegendo-se presidente em 2022.',
    viralClaim: 'Postagens afirmando que Lula é "ficha suja" e não poderia exercer mandato presidencial.',
    viralPostUrls: [
      { platform: 'Agência Lupa', url: 'https://lupa.uol.com.br/jornalismo/2022/09/27/lula-lava-jato-stf-inocentado-anulado/', label: 'Checagem Agência Lupa - Anulações do STF' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=lula+anulacao+condenacoes+stf+moro+suspeicao', label: 'Vídeo da decisão do STF' }
    ],
    officialProofUrl: {
      name: 'Acórdão do STF - HC 193.726 e HC 164.493 (Suspeição de Moro e Extinção)',
      url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=6128456'
    },
    sources: [
      {
        name: 'Agência Lupa - Entenda as Decisões do STF que Anularam Processos de Lula',
        url: 'https://lupa.uol.com.br/jornalismo/2022/09/27/lula-lava-jato-stf-inocentado-anulado/',
        type: 'agencia'
      },
      {
        name: 'Supremo Tribunal Federal - Acórdão HC 193.726 (Incompetência da 13ª Vara)',
        url: 'https://portal.stf.jus.br/processos/detalhe.asp?incidente=6128456',
        type: 'tribunal'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Lula+Lava+Jato+anulacao+STF+eleicoes',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'Agência Lupa / Estadão Verifica',
    sourceUrl: 'https://lupa.uol.com.br/jornalismo/2022/09/27/lula-lava-jato-stf-inocentado-anulado/',
    publishedAt: '2022-09-27',
    category: 'Leis & Votações',
    tags: ['Lula', 'Lava Jato', 'STF', 'Sergio Moro', 'Triplex', 'Atibaia', 'Anulação', 'Ficha Limpa']
  },
  {
    id: 'chk-bolsonaro-condenado-tse-inelegivel',
    title: 'Jair Bolsonaro foi condenado pelo TSE e está inelegível até 2030',
    verdict: 'FATO',
    politician: {
      id: 'jair-bolsonaro',
      name: 'Jair Messias Bolsonaro',
      role: 'Presidente',
      state: 'BR',
      party: 'PL',
      photoUrl: '/images/politicians/jair-bolsonaro.jpg',
    },
    summary: 'Verdadeiro. O Tribunal Superior Eleitoral condenou Bolsonaro por 5 votos a 2 por abuso de poder político e uso indevido dos meios de comunicação oficial, tornando-o inelegível até 2030.',
    detailedExplanation: 'Em 30 de junho de 2023, o Plenário do TSE julgou procedente a Ação de Investigação Judicial Eleitoral (Aije 0600814-85) referente à reunião com diplomatas no Palácio da Alvorada em 2022. Em outubro de 2023, o tribunal aplicou nova condenação de inelegibilidade na Aije 0600157-55 (7 de Setembro). Na esfera criminal, o ex-presidente foi formalmente indiciado pela Polícia Federal perante o STF na Pet 12.100 por tentativa de golpe de Estado e abolição violenta do Estado Democrático de Direito, estando sob retenção judicial de passaporte.',
    viralClaim: 'Afirmações de que Jair Bolsonaro foi condenado pela Justiça e está impedido de concorrer a qualquer cargo público até 2030.',
    viralPostUrls: [
      { platform: 'G1 Política', url: 'https://g1.globo.com/politica/noticia/2023/06/30/tse-julga-acao-contra-bolsonaro.ghtml', label: 'Cobertura Oficial do Julgamento no TSE' },
      { platform: 'YouTube', url: 'https://www.youtube.com/results?search_query=tse+condena+bolsonaro+inelegivel+2030', label: 'Transmissão do Julgamento da TV Justiça' }
    ],
    officialProofUrl: {
      name: 'Acórdão do Tribunal Superior Eleitoral - Aije 0600814-85 (Condenação por Abuso de Poder)',
      url: 'https://www.tse.jus.br/comunicacao/noticias/2023/Junho/por-maioria-plenario-do-tse-declara-jair-bolsonaro-inelegivel-por-8-anos'
    },
    sources: [
      {
        name: 'Tribunal Superior Eleitoral - Notícia Oficial e Acórdão Aije 0600814-85',
        url: 'https://www.tse.jus.br/comunicacao/noticias/2023/Junho/por-maioria-plenario-do-tse-declara-jair-bolsonaro-inelegivel-por-8-anos',
        type: 'tribunal'
      },
      {
        name: 'G1 Política - Plenário do TSE declara Jair Bolsonaro inelegível por 8 anos',
        url: 'https://g1.globo.com/politica/noticia/2023/06/30/tse-julga-acao-contra-bolsonaro.ghtml',
        type: 'agencia'
      },
      {
        name: 'Google Fact Check Tools - Auditoria Aberta IFCN',
        url: 'https://toolbox.google.com/factcheck/explorer/search/list:recent;query=Jair+Bolsonaro+condenado+TSE+inelegivel+2030',
        type: 'auditoria_aberta'
      }
    ],
    sourceAgency: 'TSE / G1 / Agência Brasil',
    sourceUrl: 'https://g1.globo.com/politica/noticia/2023/06/30/tse-julga-acao-contra-bolsonaro.ghtml',
    publishedAt: '2023-06-30',
    category: 'Eleições',
    tags: ['Jair Bolsonaro', 'TSE', 'Condenação', 'Inelegível', 'Golpe', 'STF', 'Embaixadores', 'Eleições 2026']
  }
];
