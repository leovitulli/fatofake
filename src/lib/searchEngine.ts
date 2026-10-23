import { FactCheck, JudicialProcess, Politician, Candidate, ElectionPoll } from '@/types';

// Normalizador de texto para busca insensível a acentos, pontuação e maiúsculas
export function normalizeText(text: string): string {
  return (text || '')
    .replace(/https?:\/\//gi, ' ')
    .replace(/www\./gi, ' ')
    .replace(/\.(com|site|org|gov|br|jus|leg)(\.[a-z]{2})?/gi, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^\w\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Mapeamento semântico de apelidos, investigações e termos populares para IDs de políticos
const POLITICIAN_ALIASES: Record<string, string> = {
  // Lula
  lula: 'lula',
  'luiz inacio': 'lula',
  'luiz inacio lula da silva': 'lula',
  'presidente lula': 'lula',

  // Flávio Bolsonaro e Dossiês Correlatos (Crimeta Russa / Bolsomaster / INSS / Rachadinha)
  'flavio bolsonaro': 'flavio-bolsonaro',
  flavio: 'flavio-bolsonaro',
  'senador flavio': 'flavio-bolsonaro',
  'senador flavio bolsonaro': 'flavio-bolsonaro',
  'flavio nantes bolsonaro': 'flavio-bolsonaro',
  '01': 'flavio-bolsonaro',
  'zero um': 'flavio-bolsonaro',
  rachadinha: 'flavio-bolsonaro',
  rachadinhas: 'flavio-bolsonaro',
  queiroz: 'flavio-bolsonaro',
  'fabricio queiroz': 'flavio-bolsonaro',
  inss: 'flavio-bolsonaro',
  'careca do inss': 'flavio-bolsonaro',
  'cpi inss': 'flavio-bolsonaro',
  'cpi do inss': 'flavio-bolsonaro',
  'fraude inss': 'flavio-bolsonaro',
  previdencia: 'flavio-bolsonaro',
  crimetarussa: 'flavio-bolsonaro',
  'crimeta russa': 'flavio-bolsonaro',
  bolsomaster: 'flavio-bolsonaro',
  'banco master': 'flavio-bolsonaro',
  tarussa: 'flavio-bolsonaro',
  'dark horse': 'flavio-bolsonaro',
  vorcaro: 'flavio-bolsonaro',
  'daniel vorcaro': 'flavio-bolsonaro',
  'willer tomaz': 'flavio-bolsonaro',
  'capitao adriano': 'flavio-bolsonaro',
  'adriano da nobrega': 'flavio-bolsonaro',
  wassef: 'flavio-bolsonaro',
  'frederick wassef': 'flavio-bolsonaro',

  // Jair Bolsonaro
  bolsonaro: 'jair-bolsonaro',
  'jair bolsonaro': 'jair-bolsonaro',
  'jair messias bolsonaro': 'jair-bolsonaro',
  'presidente bolsonaro': 'jair-bolsonaro',
  'ex-presidente bolsonaro': 'jair-bolsonaro',

  // Demais Líderes
  tarcisio: 'tarcisio-de-freitas',
  'tarcisio de freitas': 'tarcisio-de-freitas',
  'tarcisio gomes': 'tarcisio-de-freitas',
  zema: 'romeu-zema',
  'romeu zema': 'romeu-zema',
  pacheco: 'rodrigo-pacheco',
  'rodrigo pacheco': 'rodrigo-pacheco',
  lira: 'arthur-lira',
  'arthur lira': 'arthur-lira',
  nikolas: 'nikolas-ferreira',
  'nikolas ferreira': 'nikolas-ferreira',
  nicolas: 'nikolas-ferreira',
  tabata: 'tabata-amaral',
  'tabata amaral': 'tabata-amaral',
  castro: 'claudio-castro',
  'claudio castro': 'claudio-castro',
  caiado: 'ronaldo-caiado',
  'ronaldo caiado': 'ronaldo-caiado',
  leite: 'eduardo-leite',
  'eduardo leite': 'eduardo-leite',
  boulos: 'guilherme-boulos',
  'guilherme boulos': 'guilherme-boulos',
  cleitinho: 'cleitinho',
  collor: 'fernando-collor',
  'fernando collor': 'fernando-collor',
  'fernando collor de mello': 'fernando-collor',
  tse: 'tse',
  'tribunal superior eleitoral': 'tse',
};

// Termos que indicam investigação e que devem ser mantidos como palavras-chave mesmo se mapeados a um político
const INVESTIGATION_TOPIC_TERMS = new Set([
  'inss',
  'careca',
  'previdencia',
  'cpi',
  'rachadinha',
  'rachadinhas',
  'queiroz',
  'master',
  'banco',
  'tarussa',
  'crimetarussa',
  'bolsomaster',
  'imoveis',
  'mansao',
  'dinheiro',
  'vivo',
  'kopenhagen',
  'chocolate',
  'chocolates',
  'wassef',
  'adriano',
  'nobrega',
  'richarlison',
  'dark',
  'horse',
  'vorcaro',
  'tomaz',
  'vacina',
  'golpe',
  'emendas',
  'mensalao',
  'mensalão',
  'triplex',
  'atibaia',
  'joias',
  'joia',
  'sauditas',
  'lava',
  'jato',
  'petrolao'
]);

export interface SmartParsedQuery {
  rawQuery: string;
  normalizedQuery: string;
  detectedPoliticianId?: string;
  detectedPoliticianName?: string;
  topicKeywords: string[];
  semanticIntentSummary: string;
}

export interface SmartSearchResult {
  parsedQuery: SmartParsedQuery;
  exactTopicMatches: Array<{ item: FactCheck; score: number }>;
  relatedPoliticianMatches: Array<{ item: FactCheck; score: number }>;
  factChecks: Array<{ item: FactCheck; score: number }>;
  exactProcesses: Array<{ item: JudicialProcess; score: number }>;
  relatedProcesses: Array<{ item: JudicialProcess; score: number }>;
  processes: Array<{ item: JudicialProcess; score: number }>;
  politicians: Array<{ item: Politician; score: number }>;
  candidates: Array<{ item: Candidate; pollTitle: string }>;
  totalCount: number;
}

/**
 * Analisa e desconstrói a consulta do usuário em Político + Assunto
 */
export function parseSearchQuery(query: string, allPoliticians: Politician[]): SmartParsedQuery {
  const norm = normalizeText(query);
  const words = norm.split(' ').filter(w => w.length > 0);

  let detectedPoliticianId: string | undefined;
  let detectedPoliticianName: string | undefined;
  const matchedTokens: string[] = [];

  // Tenta encontrar combinações de palavras (N-grams) de 4 até 1 palavra
  for (let n = Math.min(4, words.length); n >= 1; n--) {
    for (let i = 0; i <= words.length - n; i++) {
      const phrase = words.slice(i, i + n).join(' ');
      if (POLITICIAN_ALIASES[phrase]) {
        detectedPoliticianId = POLITICIAN_ALIASES[phrase];
        // Guarda os tokens que bateram
        for (let j = i; j < i + n; j++) {
          matchedTokens.push(words[j]);
        }
        break;
      }
    }
    if (detectedPoliticianId) break;
  }

  // As palavras-chave do tema são todas as palavras com > 2 letras,
  // exceto conectivos e palavras do político (a não ser que sejam termos de investigação como "rachadinha")
  const stopWords = new Set(['https', 'http', 'com', 'site', 'org', 'www', 'de', 'da', 'do', 'em', 'com', 'por', 'sobre', 'que', 'para', 'dos', 'das', 'uma', 'uns']);
  const topicKeywords: string[] = [];

  for (const w of words) {
    if (w.length < 2 || stopWords.has(w)) continue;
    const isMatchedPoliticianWord = matchedTokens.includes(w);
    const isInvestigationTerm = INVESTIGATION_TOPIC_TERMS.has(w);

    if (!isMatchedPoliticianWord || isInvestigationTerm) {
      if (!topicKeywords.includes(w)) {
        topicKeywords.push(w);
      }
    }
  }

  if (detectedPoliticianId) {
    const p = allPoliticians.find(item => item.id === detectedPoliticianId);
    detectedPoliticianName = p ? p.popularName : detectedPoliticianId.toUpperCase();
  }

  // Resumo semântico para exibição amigável ao cidadão
  let semanticIntentSummary = '';
  if (detectedPoliticianName && topicKeywords.length > 0) {
    semanticIntentSummary = `Buscando checagens e processos de "${detectedPoliticianName}" sobre "${topicKeywords.join(' ')}"`;
  } else if (detectedPoliticianName) {
    semanticIntentSummary = `Filtrando histórico cívico e judicial de "${detectedPoliticianName}"`;
  } else if (topicKeywords.length > 0) {
    semanticIntentSummary = `Buscando tema "${topicKeywords.join(' ')}" em notícias e tribunais`;
  } else {
    semanticIntentSummary = `Mostrando resultados para "${query}"`;
  }

  return {
    rawQuery: query,
    normalizedQuery: norm,
    detectedPoliticianId,
    detectedPoliticianName,
    topicKeywords,
    semanticIntentSummary,
  };
}

/**
 * Motor de Busca Inteligente Cívico
 */
export function executeSmartSearch(
  query: string,
  factChecks: FactCheck[],
  processes: JudicialProcess[],
  politicians: Politician[],
  polls: ElectionPoll[]
): SmartSearchResult {
  if (!query.trim()) {
    return {
      parsedQuery: {
        rawQuery: '',
        normalizedQuery: '',
        topicKeywords: [],
        semanticIntentSummary: '',
      },
      exactTopicMatches: factChecks.map(item => ({ item, score: 1 })),
      relatedPoliticianMatches: [],
      factChecks: factChecks.map(item => ({ item, score: 1 })),
      exactProcesses: processes.map(item => ({ item, score: 1 })),
      relatedProcesses: [],
      processes: processes.map(item => ({ item, score: 1 })),
      politicians: politicians.map(item => ({ item, score: 1 })),
      candidates: [],
      totalCount: factChecks.length + processes.length + politicians.length,
    };
  }

  const parsed = parseSearchQuery(query, politicians);
  const { detectedPoliticianId, topicKeywords, normalizedQuery } = parsed;

  // 1. Pontuação de Fact Checks
  const scoredFactChecks = factChecks
    .map(check => {
      let score = 0;
      const normTitle = normalizeText(check.title);
      const normSummary = normalizeText(check.summary);
      const normExplanation = normalizeText(check.detailedExplanation);
      const normViral = normalizeText(check.viralClaim || '');
      const normTags = check.tags.map(normalizeText).join(' ');
      const normAgency = normalizeText(check.sourceAgency);

      // Correspondência com político detectado
      if (detectedPoliticianId) {
        if (check.politician.id === detectedPoliticianId) {
          score += 50;
        } else if (normTitle.includes(detectedPoliticianId) || normTags.includes(detectedPoliticianId)) {
          score += 25;
        }
      }

      // Correspondência com o nome do político vinculado à checagem
      const checkPolNorm = normalizeText(`${check.politician.name} ${check.politician.party}`);
      if (checkPolNorm.includes(normalizedQuery)) {
        score += 35;
      }

      // Correspondência com cada palavra do tema (Bônus forte para assunto específico)
      for (const kw of topicKeywords) {
        if (normTitle.includes(kw)) score += 60;
        if (normSummary.includes(kw)) score += 40;
        if (normTags.includes(kw)) score += 45;
        if (normViral.includes(kw)) score += 30;
        if (normExplanation.includes(kw)) score += 20;
        if (normAgency.includes(kw)) score += 10;
        if (checkPolNorm.includes(kw)) score += 25;
      }

      // Correspondência de texto literal completo
      if (normTitle.includes(normalizedQuery)) score += 50;
      if (normSummary.includes(normalizedQuery)) score += 40;
      if (normTags.includes(normalizedQuery)) score += 45;

      return { item: check, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score);

  // Separação em Correspondência Exata de Tema vs Outras Checagens do Político
  const exactTopicMatches: Array<{ item: FactCheck; score: number }> = [];
  const relatedPoliticianMatches: Array<{ item: FactCheck; score: number }> = [];

  if (topicKeywords.length > 0) {
    for (const match of scoredFactChecks) {
      const check = match.item;
      const normTitle = normalizeText(check.title);
      const normSummary = normalizeText(check.summary);
      const normTags = check.tags.map(normalizeText).join(' ');
      const normViral = normalizeText(check.viralClaim || '');
      const normExplanation = normalizeText(check.detailedExplanation);

      const matchesTopic = topicKeywords.some(kw => 
        normTitle.includes(kw) || 
        normSummary.includes(kw) || 
        normTags.includes(kw) || 
        normViral.includes(kw) ||
        normExplanation.includes(kw)
      );

      if (matchesTopic) {
        exactTopicMatches.push(match);
      } else if (detectedPoliticianId && check.politician.id === detectedPoliticianId) {
        relatedPoliticianMatches.push(match);
      }
    }
  } else {
    exactTopicMatches.push(...scoredFactChecks);
  }

  // 2. Pontuação de Processos Judiciais
  const scoredProcesses = processes
    .map(proc => {
      let score = 0;
      const normNumber = normalizeText(proc.processNumber);
      const normSubject = normalizeText(proc.subject);
      const normSummary = normalizeText(proc.summary);
      const normCourt = normalizeText(proc.court);
      const normDefense = normalizeText(proc.defensePosition);
      const procPolNorm = normalizeText(proc.politicianName);

      // Correspondência com político
      if (detectedPoliticianId) {
        if (proc.politicianId === detectedPoliticianId) {
          score += 60;
        }
      }

      // Correspondência com o nome do político no processo
      if (procPolNorm.includes(normalizedQuery)) {
        score += 40;
      }

      // Correspondência com tema ou número
      for (const kw of topicKeywords) {
        if (normSubject.includes(kw)) score += 50;
        if (normSummary.includes(kw)) score += 35;
        if (normNumber.includes(kw)) score += 60;
        if (normCourt.includes(kw)) score += 30;
        if (normDefense.includes(kw)) score += 15;
        if (procPolNorm.includes(kw)) score += 25;
      }

      // Busca literal de número de processo (ex: "inq 3989", "hc 193")
      if (normNumber.includes(normalizedQuery) || normSubject.includes(normalizedQuery)) {
        score += 50;
      }

      return { item: proc, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score);

  // Separação dos Processos em Correspondência Exata de Tema vs Outros Processos do Político
  const exactProcesses: Array<{ item: JudicialProcess; score: number }> = [];
  const relatedProcesses: Array<{ item: JudicialProcess; score: number }> = [];

  if (topicKeywords.length > 0) {
    for (const match of scoredProcesses) {
      const proc = match.item;
      const normNumber = normalizeText(proc.processNumber);
      const normSubject = normalizeText(proc.subject);
      const normSummary = normalizeText(proc.summary);
      const normCourt = normalizeText(proc.court);

      const matchesTopic = topicKeywords.some(kw =>
        normSubject.includes(kw) ||
        normSummary.includes(kw) ||
        normNumber.includes(kw) ||
        normCourt.includes(kw)
      );

      if (matchesTopic) {
        exactProcesses.push(match);
      } else if (detectedPoliticianId && proc.politicianId === detectedPoliticianId) {
        relatedProcesses.push(match);
      }
    }
  } else {
    exactProcesses.push(...scoredProcesses);
  }

  // 3. Pontuação de Políticos
  const scoredPoliticians = politicians
    .map(p => {
      let score = 0;
      const normName = normalizeText(p.name);
      const normPopular = normalizeText(p.popularName);
      const normParty = normalizeText(p.party);
      const normBio = normalizeText(p.bio);

      if (detectedPoliticianId && p.id === detectedPoliticianId) {
        score += 100;
      }

      if (normPopular.includes(normalizedQuery) || normName.includes(normalizedQuery)) {
        score += 80;
      }

      for (const kw of topicKeywords) {
        if (normPopular.includes(kw) || normName.includes(kw)) score += 45;
        if (normParty.includes(kw)) score += 30;
        if (normBio.includes(kw)) score += 20;
      }

      // Bônus se o político é o foco de processos ou checagens que bateram com a busca
      const matchedProcsForPol = scoredProcesses.filter(pr => pr.item.politicianId === p.id).length;
      const matchedChecksForPol = scoredFactChecks.filter(c => c.item.politician.id === p.id).length;
      if (matchedProcsForPol > 0 || matchedChecksForPol > 0) {
        score += (matchedProcsForPol * 25) + (matchedChecksForPol * 15);
      }

      return { item: p, score };
    })
    .filter(res => res.score > 0)
    .sort((a, b) => b.score - a.score);

  // 4. Candidatos nas Pesquisas Eleitorais
  const matchedCandidates: Array<{ item: Candidate; pollTitle: string }> = [];
  for (const poll of polls) {
    for (const cand of poll.candidates) {
      const candNorm = normalizeText(`${cand.name} ${cand.popularName} ${cand.party} ${cand.number}`);
      const matchesPol = detectedPoliticianId && cand.politicianId === detectedPoliticianId;
      const matchesText = candNorm.includes(normalizedQuery) || topicKeywords.some(kw => candNorm.includes(kw));

      if (matchesPol || matchesText) {
        matchedCandidates.push({ item: cand, pollTitle: poll.title });
      }
    }
  }

  const totalCount = exactTopicMatches.length + relatedPoliticianMatches.length + exactProcesses.length + relatedProcesses.length + scoredPoliticians.length + matchedCandidates.length;

  return {
    parsedQuery: parsed,
    exactTopicMatches,
    relatedPoliticianMatches,
    factChecks: scoredFactChecks,
    exactProcesses,
    relatedProcesses,
    processes: scoredProcesses,
    politicians: scoredPoliticians,
    candidates: matchedCandidates,
    totalCount,
  };
}
