import { ElectionPoll } from '@/types';

export const INITIAL_POLLS: ElectionPoll[] = [
  {
    id: 'eleicao-presidencia-2026',
    title: 'Pesquisa Cívica: Presidência da República 2026 (2º Turno)',
    role: 'Presidente',
    state: 'BR',
    round: '2º Turno',
    year: 2026,
    description: 'Enquete cívica auditada com voto secreto por CPF único. Disputa oficial do 2º Turno entre os dois finalistas para a Presidência da República.',
    status: 'ABERTA',
    totalVotes: 2,
    candidates: [
      {
        id: 'cand-lula',
        name: 'Luiz Inácio Lula da Silva',
        popularName: 'Lula',
        number: '13',
        party: 'PT',
        photoUrl: '/images/politicians/lula.jpg',
        politicianId: 'lula',
        votes: 1,
        judicialStatusSummary: 'Processos da Lava Jato anulados pelo STF · Ficha Limpa apto',
      },
      {
        id: 'cand-flavio',
        name: 'Flávio Nantes Bolsonaro',
        popularName: 'Flávio Bolsonaro',
        number: '22',
        party: 'PL',
        photoUrl: '/images/politicians/flavio-bolsonaro.jpg',
        politicianId: 'flavio-bolsonaro',
        votes: 1,
        judicialStatusSummary: 'Ficha Limpa apto · Processo criminal da Alerj arquivado pelo TJ-RJ sem julgamento de mérito',
      },
      {
        id: 'cand-branco-nulo',
        name: 'Voto em Branco ou Nulo',
        popularName: 'Branco / Nulo',
        number: '00',
        party: 'Nenhum',
        photoUrl: '/images/politicians/branco-nulo.svg',
        votes: 0,
      }
    ]
  },
  {
    id: 'eleicao-governo-sp-2026',
    title: 'Pesquisa Cívica: Governo do Estado de São Paulo 2026 (2º Turno)',
    role: 'Governador',
    state: 'SP',
    round: '2º Turno',
    year: 2026,
    description: 'Levantamento oficial de 2º Turno para o Palácio dos Bandeirantes com checagem de fatos e situação judicial cruzada.',
    status: 'ABERTA',
    totalVotes: 0,
    candidates: [
      {
        id: 'cand-sp-tarcisio',
        name: 'Tarcísio Gomes de Freitas',
        popularName: 'Tarcísio de Freitas',
        number: '10',
        party: 'Republicanos',
        photoUrl: '/images/politicians/tarcisio-de-freitas.jpg',
        politicianId: 'tarcisio-de-freitas',
        votes: 0,
        judicialStatusSummary: 'Contas aprovadas no TSE · Sem condenações',
      },
      {
        id: 'cand-sp-boulos',
        name: 'Guilherme Castro Boulos',
        popularName: 'Guilherme Boulos',
        number: '50',
        party: 'PSOL',
        photoUrl: '/images/politicians/guilherme-boulos.jpg',
        politicianId: 'guilherme-boulos',
        votes: 0,
        judicialStatusSummary: 'Representações eleitorais extintas · Ficha Limpa apto',
      },
      {
        id: 'cand-sp-branco',
        name: 'Voto em Branco ou Nulo',
        popularName: 'Branco / Nulo',
        number: '00',
        party: 'Nenhum',
        photoUrl: '/images/politicians/branco-nulo.svg',
        votes: 0,
      }
    ]
  }
];
