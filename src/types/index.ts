export type VerdictType = 'FATO' | 'FAKE' | 'ENGANOSO' | 'EXAGERADO';

export type PoliticalRole =
  | 'Presidente'
  | 'Governador'
  | 'Senador'
  | 'Deputado Federal'
  | 'Prefeito'
  | 'Vereador';

export type ProcessStatus =
  | 'EM_INVESTIGACAO'      // Inquérito Policial ou Investigação preliminar
  | 'REU_EM_ANDAMENTO'     // Denúncia aceita, réu em ação penal/civil
  | 'CONDENADO'            // Condenação em 1ª ou 2ª instância / Inelegibilidade
  | 'ARQUIVADO_ABSOLVIDO'; // Processo extinto, arquivado ou réu inocentado

export interface JudicialProcess {
  id: string;
  politicianId: string;
  politicianName: string;
  politicianRole: PoliticalRole;
  processNumber: string; // Ex: "Inq 4879", "AP 1024"
  court: 'STF' | 'STJ' | 'TSE' | 'TRF-1' | 'TRF-3' | 'TJSP' | 'TJMG' | 'TJRJ' | 'TCU';
  subject: string; // Ex: "Improbidade Administrativa", "Crimes contra a Administração Pública"
  status: ProcessStatus;
  statusLabel: string;
  summary: string; // O que está em investigação explicado em linguagem popular
  defensePosition: string; // O que a defesa do político declarou oficialmente
  lastUpdate: string;
  courtUrl: string; // Link direto para a consulta no site do tribunal
}

export type EligibilityStatus = 'APTO_FICHA_LIMPA' | 'INELEGIVEL' | 'CONDENADO' | 'EM_JULGAMENTO';

export interface Politician {
  id: string;
  name: string;
  popularName: string;
  role: PoliticalRole;
  candidateFor?: PoliticalRole; // Cargo que disputa em 2026 (ex: 'Presidente')
  state: string; // Ex: 'BR' para federal ou 'SP', 'RJ', 'MG', etc.
  party: string;
  photoUrl: string;
  bio: string;
  alreadyElected?: boolean;
  currentMandate?: string;
  eligibilityStatus?: EligibilityStatus; // Ficha Limpa vs Inelegível pelo TSE
  eligibilityDetails?: string; // Ex: "Inelegível até 2030 (TSE)" ou "Ficha Limpa Apto"
  stats: {
    totalChecks: number;
    fatos: number;
    fakes: number;
    enganosos: number;
    judicialProcesses?: number;
    processosAtivos?: number;
    processosArquivados?: number;
  };
}

export interface ViralSourceLink {
  platform: 'TikTok' | 'Instagram' | 'X' | 'YouTube' | 'WhatsApp' | 'Web Archive' | 'Portal' | 'Imprensa' | string;
  url: string;
  label?: string;
}

export interface OfficialProofLink {
  name: string; // Ex: 'Diário Oficial da União', 'Acórdão do STF', 'Relatório Coaf'
  url: string;
}

export interface VerificationSource {
  name: string; // Ex: 'G1 Fato ou Fake', 'Agência Lupa', 'STF - Acórdão', 'Diário Oficial'
  url: string;
  type: 'agencia' | 'tribunal' | 'documento_oficial' | 'arquivo' | 'imprensa' | 'auditoria_aberta';
  description?: string;
  isArchiveAvailable?: boolean;
}

export interface FactCheck {
  id: string;
  title: string; // A afirmação viral / boato
  verdict: VerdictType;
  politician: {
    id: string;
    name: string;
    role: PoliticalRole;
    state: string;
    party: string;
    photoUrl: string;
  };
  summary: string; // Explicação em 2-3 frases simples para o cidadão comum
  detailedExplanation: string; // Análise aprofundada com os fatos documentados
  viralClaim?: string; // O que dizia a mensagem viral / vídeo / áudio
  viralPostUrls?: ViralSourceLink[]; // Links reais dos posts/vídeos no TikTok, Instagram, X, etc.
  sourceAgency: string; // Ex: 'G1 Fato ou Fake', 'Agência Lupa', 'Aos Fatos', 'TSE Fato ou Boato'
  sourceUrl: string;
  officialProofUrl?: OfficialProofLink; // Link para documento oficial (DOU, Tribunal, etc.)
  sources?: VerificationSource[]; // Múltiplas fontes verificadas e checagens correlatas
  publishedAt: string;
  category: 'Eleições' | 'Economia' | 'Saúde' | 'Leis & Votações' | 'Declarações' | 'Segurança' | 'Habitação' | 'Educação';
  tags: string[];
  isLiveResult?: boolean; // Indica resultado capturado em tempo real da web aberta
}

export interface Candidate {
  id: string;
  name: string;
  popularName: string;
  number: string;
  party: string;
  coalition?: string;
  photoUrl: string;
  politicianId?: string; // Link para a ficha do político no sistema
  votes: number;
  judicialStatusSummary?: string; // Ex: "Ficha Limpa - Sem condenações" ou "1 inquérito no STF"
}

export interface ElectionPoll {
  id: string;
  title: string;
  role: PoliticalRole;
  state: string; // 'BR' para nacional ou UF
  year: number;
  description: string;
  status: 'ABERTA' | 'ENCERRADA';
  round?: '1º Turno' | '2º Turno';
  surveyDate?: string;
  candidates: Candidate[];
  totalVotes: number;
}

export interface VoterRegistration {
  cpfHash: string; // Hash SHA-256 + Salt
  nameMasked: string; // Ex: "Maria S***"
  state: string;
  city: string;
  hasVoted: boolean;
  registeredAt: string;
  pollId: string;
}

export interface AnonymousBallot {
  pollId: string;
  candidateId: string;
  role: PoliticalRole;
  state: string;
  timestampQuarterHour: string; // Agrupado para impedir correlação temporal
}
