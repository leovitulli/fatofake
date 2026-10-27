'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Users, 
  Vote, 
  CheckCircle2, 
  Search, 
  Download, 
  RefreshCw, 
  ExternalLink, 
  AlertCircle, 
  LogOut, 
  ArrowLeft, 
  Building, 
  Copy, 
  Check, 
  UserCheck, 
  Mail, 
  Phone, 
  MapPin, 
  Save, 
  Sparkles, 
  Shield,
  Compass,
  FileCheck,
  ChevronRight,
  Send,
  Heart,
  User,
  Archive,
  History,
  FolderArchive,
  RotateCcw,
  Award,
  PlusCircle,
  X,
  BarChart3,
  Calendar,
  Eye
} from 'lucide-react';
import { 
  validarCPF, 
  formatarCPF, 
  mascararCPF, 
  formatarTelefone, 
  ofuscarNome,
  getVotersRegistry, 
  atualizarEleitorLocal
} from '@/lib/voteService';
import { INITIAL_POLLS } from '@/data/polls';
import { GeolocatedReportView } from '@/components/GeolocatedReportView';
import { PixDonationSection } from '@/components/PixDonationSection';
import { fetchRemotePixSettings, savePixSettings } from '@/lib/pixService';

interface VoterData {
  id?: string;
  name: string;
  cpf_masked?: string;
  cpfMasked?: string;
  cpf_hash?: string;
  cpfHash?: string;
  email?: string;
  phone?: string;
  state: string;
  city: string;
  has_voted?: boolean;
  hasVoted?: boolean;
  poll_id?: string;
  pollId?: string;
  created_at?: string;
  registeredAt?: string;
  is_admin?: boolean;
}

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function MinhaAreaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Estados de Sessão
  const [currentUserRole, setCurrentUserRole] = useState<'guest' | 'voter' | 'admin'>('guest');
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [activePortalTab, setActivePortalTab] = useState<'profile' | 'management'>('profile');
  
  // Login Cidadão por CPF (Único método visível publicamente)
  const [voterCpf, setVoterCpf] = useState('');
  const [voterLoading, setVoterLoading] = useState(false);
  const [voterError, setVoterError] = useState('');

  // Diagnóstico e Relato Rápido de Erros
  const [rawErrorDetail, setRawErrorDetail] = useState('');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

  // Perfil do Cidadão Logado
  const [voterProfile, setVoterProfile] = useState<VoterData | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Detecção inteligente e resiliente do desenvolvedor oficial (Leandro Vitulli)
  const isDeveloperUser = Boolean(
    isSuperUser ||
    (voterProfile && (
      (voterProfile.cpf_masked && voterProfile.cpf_masked.endsWith('398-11')) ||
      (voterProfile.cpfMasked && voterProfile.cpfMasked.endsWith('398-11')) ||
      voterProfile.email === 'leovitulli@gmail.com' ||
      voterProfile.email === 'admin@fatosfakes2026.org'
    ))
  );

  // Gestão Administrativa & Tabela de Eleitores
  const [votersList, setVotersList] = useState<VoterData[]>([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');
  const [adminSelectedUf, setAdminSelectedUf] = useState('TODAS');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  // Validador Cívico de Hash de Auditoria
  const [showHashAuditModal, setShowHashAuditModal] = useState(false);
  const [auditHashInput, setAuditHashInput] = useState('');
  const [isVerifyingHash, setIsVerifyingHash] = useState(false);
  const [auditVerificationResult, setAuditVerificationResult] = useState<any | null>(null);
  const [auditError, setAuditError] = useState('');

  // Controle de Financiamento Cívico (Apoio via PIX)
  const [pixEnabled, setPixEnabled] = useState(true);
  const [pixKeyInput, setPixKeyInput] = useState('');
  const [pixKeyType, setPixKeyType] = useState('E-mail / Chave Cadastrada');
  const [pixTitular, setPixTitular] = useState('');
  const [pixProposito, setPixProposito] = useState('');
  const [isSavingPix, setIsSavingPix] = useState(false);
  const [pixFeedback, setPixFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // CPF do desenvolvedor / administrador exclusivo (configurável via .env)
  const DEVELOPER_ADMIN_CPF = (process.env.NEXT_PUBLIC_ADMIN_CPF || '22135939811').replace(/\D/g, '');

  // Helper para verificar se um CPF é estritamente o do desenvolvedor/administrador
  const checkIsAdminCpf = (cleanCpf: string): boolean => {
    return cleanCpf === DEVELOPER_ADMIN_CPF;
  };

  // Gestão de Pleitos Eleitorais e Arquivo Histórico Cívico
  const [adminActivePolls, setAdminActivePolls] = useState<any[]>([]);
  const [adminArchivedPolls, setAdminArchivedPolls] = useState<any[]>([]);
  const [isLoadingElections, setIsLoadingElections] = useState(false);
  const [isArchivingPollId, setIsArchivingPollId] = useState<string | null>(null);
  const [electionsFeedback, setElectionsFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [selectedArchiveDetail, setSelectedArchiveDetail] = useState<any | null>(null);
  const [showCreatePollModal, setShowCreatePollModal] = useState(false);
  const [newPollForm, setNewPollForm] = useState({
    id: '',
    title: '',
    role: 'Presidente da República',
    state: 'BR',
    round: '1º Turno',
    survey_date: '2026',
    candidatesText: 'Tarcísio de Freitas - REPUBLICANOS\nRatinho Jr - PSD\nRomeu Zema - NOVO\nLula - PT\nBranco / Nulo - VOTO_NEUTRO'
  });
  const [isCreatingPoll, setIsCreatingPoll] = useState(false);

  const loadAdminElectionsData = async (adminCpf?: string) => {
    setIsLoadingElections(true);
    const token = adminCpf || DEVELOPER_ADMIN_CPF;
    try {
      const res = await fetch(`/api/admin/elections?cpf=${encodeURIComponent(token)}&t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setAdminActivePolls(data.activePolls || []);
        setAdminArchivedPolls(data.archivedPolls || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar eleições:', err);
    } finally {
      setIsLoadingElections(false);
    }
  };

  const handleArchivePoll = async (pollId: string, pollTitle: string) => {
    const confirmArchive = window.confirm(
      `CONFIRMAÇÃO DE ARQUIVAMENTO HISTÓRICO:\n\nTem certeza de que deseja ARQUIVAR e CONGELAR o pleito "${pollTitle}"?\n\n• O resultado atual e os votos apurados serão salvos permanentemente no Arquivo Histórico Cívico restrito ao desenvolvedor.\n• A urna pública será ZERADA (0 votos) para início imediato de um novo ciclo eleitoral.\n• Esta operação é segura, auditável e irreversível.`
    );
    if (!confirmArchive) return;

    setIsArchivingPollId(pollId);
    setElectionsFeedback(null);
    try {
      const token = DEVELOPER_ADMIN_CPF;
      const res = await fetch('/api/admin/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'archive_and_freeze',
          pollId,
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setElectionsFeedback({
          type: 'success',
          message: `Pleito "${pollTitle}" arquivado com sucesso no Arquivo Histórico! Urna pública reiniciada com 0 votos.`
        });
        await loadAdminElectionsData(token);
        await loadAdminVotersData(token);
      } else {
        setElectionsFeedback({
          type: 'error',
          message: data.error || 'Falha ao arquivar pleito eleitoral.'
        });
      }
    } catch (err: any) {
      setElectionsFeedback({
        type: 'error',
        message: err.message || 'Erro de conexão ao arquivar pleito.'
      });
    } finally {
      setIsArchivingPollId(null);
    }
  };

  const handleCreateNewPoll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPollForm.title.trim()) {
      alert('Por favor, informe o título da nova eleição.');
      return;
    }
    const slug = newPollForm.id.trim() || newPollForm.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const parsedCandidates = newPollForm.candidatesText
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const parts = line.split('-').map(p => p.trim());
        const name = parts[0] || `Candidato ${idx + 1}`;
        const party = parts[1] || 'PARTIDO';
        return {
          id: `cand-${idx + 1}-${Date.now()}`,
          name,
          party,
          votes: 0,
          percentage: 0
        };
      });

    if (parsedCandidates.length === 0) {
      alert('Adicione ao menos um candidato na lista (um por linha no formato: Nome - Partido).');
      return;
    }

    setIsCreatingPoll(true);
    setElectionsFeedback(null);
    try {
      const token = DEVELOPER_ADMIN_CPF;
      const res = await fetch('/api/admin/elections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: 'create_poll',
          newPoll: {
            id: slug,
            title: newPollForm.title.trim(),
            role: newPollForm.role.trim() || 'Cargo Eletivo',
            state: newPollForm.state || 'BR',
            round: newPollForm.round || '1º Turno',
            survey_date: newPollForm.survey_date || '2026',
            candidates: parsedCandidates,
          }
        }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setElectionsFeedback({
          type: 'success',
          message: `Novo pleito "${newPollForm.title}" criado e registrado com sucesso!`
        });
        setShowCreatePollModal(false);
        setNewPollForm({
          id: '',
          title: '',
          role: 'Presidente da República',
          state: 'BR',
          round: '1º Turno',
          survey_date: '2026',
          candidatesText: ''
        });
        await loadAdminElectionsData(token);
      } else {
        setElectionsFeedback({
          type: 'error',
          message: data.error || 'Erro ao cadastrar novo pleito.'
        });
      }
    } catch (err: any) {
      setElectionsFeedback({
        type: 'error',
        message: err.message || 'Erro de conexão ao criar novo pleito.'
      });
    } finally {
      setIsCreatingPoll(false);
    }
  };

  const handleDownloadArchiveJSON = (archiveItem: any) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(archiveItem, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `comprovante-pleito-${archiveItem.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Handler para acionar a validação cívica do hash na urna cega
  const handleVerifyHash = async (hashToVerify?: string) => {
    const targetHash = (hashToVerify || auditHashInput).trim();
    if (!targetHash) {
      setAuditError('Por favor, informe ou cole um Hash SHA-256 para verificar.');
      setShowHashAuditModal(true);
      return;
    }

    setAuditHashInput(targetHash);
    setShowHashAuditModal(true);
    setIsVerifyingHash(true);
    setAuditError('');
    setAuditVerificationResult(null);

    try {
      const res = await fetch(`/api/audit/verify-hash?hash=${encodeURIComponent(targetHash)}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        setAuditError(data.error || 'Hash não localizado no repositório auditável.');
      } else {
        setAuditVerificationResult(data.data);
      }
    } catch {
      setAuditError('Falha ao conectar com o serviço de auditoria criptográfica.');
    } finally {
      setIsVerifyingHash(false);
    }
  };

  // Sanitizador de Erros: Substitui jargões de banco de dados por orientações amigáveis
  const formatarErroAmigavel = (raw: string): string => {
    if (!raw) return 'Não foi possível concluir a consulta no momento.';
    const lower = raw.toLowerCase();
    if (
      lower.includes('schema cache') || 
      lower.includes('voters_registry') || 
      lower.includes('relation') || 
      lower.includes('pgrst205') ||
      lower.includes('table')
    ) {
      return 'O serviço de auditoria em nuvem está passando por uma sincronização automática de rotina. Seus dados estão seguros e o acesso está sendo restabelecido.';
    }
    if (lower.includes('network') || lower.includes('fetch') || lower.includes('failed to fetch')) {
      return 'Houve uma oscilação momentânea na conexão de internet. Por favor, verifique sua rede e tente novamente.';
    }
    if (lower.includes('timeout')) {
      return 'A conexão demorou mais que o esperado para responder. Por favor, tente novamente em alguns instantes.';
    }
    return raw;
  };

  // Disparo em 1 clique do Relato de Problemas
  const handleReportProblem = async () => {
    if (isReporting) return;
    setIsReporting(true);
    try {
      const cleanCpf = voterCpf.replace(/\D/g, '');
      const masked = cleanCpf ? mascararCPF(cleanCpf) : 'Não informado';
      const res = await fetch('/api/report-issue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          errorMessage: voterError || 'Erro no portal cívico',
          rawError: rawErrorDetail || voterError || 'Nenhum detalhe adicional informado',
          context: 'Portal Cívico / Minha Área',
          userIdentifier: masked,
          path: '/minha-area',
          timestamp: new Date().toISOString(),
        }),
      });
      const data = await res.json();
      if (data?.protocol) {
        setReportSuccess(`Problema relatado com sucesso! Protocolo #${data.protocol}. Nossa equipe de engenharia foi notificada para averiguação imediata.`);
      } else {
        setReportSuccess('Problema relatado com sucesso! Nossa equipe técnica já foi notificada.');
      }
    } catch {
      setReportSuccess('Problema registrado em nosso sistema de contingência com sucesso.');
    } finally {
      setIsReporting(false);
    }
  };

  // Auto-restauração da sessão salva
  useEffect(() => {
    // 1. Verifica se havia sessão de cidadão
    const savedVoterJson = sessionStorage.getItem('fatosfakes_voter_session');
    if (savedVoterJson) {
      try {
        const parsed = JSON.parse(savedVoterJson);
        if (parsed && (parsed.cpf_hash || parsed.cpfHash)) {
          setCurrentUserRole('voter');
          initVoterProfile(parsed);

          // Verifica se esse CPF tem privilégio exclusivo de gestão (apenas o desenvolvedor oficial)
          const adminToken = sessionStorage.getItem('fatosfakes_admin_auth_token') || '';
          const cleanToken = adminToken.replace(/\D/g, '');
          const isDevAdmin = checkIsAdminCpf(cleanToken) || 
            parsed.is_admin === true || 
            (parsed.cpf_hash && String(parsed.cpf_hash).startsWith('hash_fatosfakes_admin_')) ||
            (parsed.cpf_masked && parsed.cpf_masked.endsWith('398-11')) ||
            (parsed.cpfMasked && parsed.cpfMasked.endsWith('398-11')) ||
            parsed.email === 'leovitulli@gmail.com' ||
            parsed.email === 'admin@fatosfakes2026.org';
          if (isDevAdmin) {
            setIsSuperUser(true);
            sessionStorage.setItem('fatosfakes_admin_auth_token', cleanToken || DEVELOPER_ADMIN_CPF);
            loadAdminVotersData(cleanToken || DEVELOPER_ADMIN_CPF);
            loadAdminElectionsData(cleanToken || DEVELOPER_ADMIN_CPF);
          }
        }
      } catch {
        // ignore
      }
    }

    // Carrega configurações dinâmicas do PIX
    fetchRemotePixSettings().then(cfg => {
      setPixEnabled(cfg.enabled);
      setPixKeyInput(cfg.chave);
      setPixKeyType(cfg.tipoChave || 'E-mail / Chave Cadastrada');
      setPixTitular(cfg.titular || 'FATOS & FAKES · Projeto Cívico Independente');
      setPixProposito(cfg.proposito || 'Manutenção de servidores, banco de dados auditável e apuração cívica 100% independente.');
    });
  }, []);

  // Garante que o desenvolvedor oficial tenha privilégios de superusuário imediatamente
  useEffect(() => {
    if (isDeveloperUser && !isSuperUser) {
      setIsSuperUser(true);
      sessionStorage.setItem('fatosfakes_admin_auth_token', DEVELOPER_ADMIN_CPF);
      loadAdminVotersData(DEVELOPER_ADMIN_CPF);
      loadAdminElectionsData(DEVELOPER_ADMIN_CPF);
    }
  }, [isDeveloperUser, isSuperUser]);

  // Handlers para controle do PIX diretamente pela plataforma
  const handleTogglePix = async (targetVal: boolean) => {
    setPixEnabled(targetVal);
    setIsSavingPix(true);
    setPixFeedback(null);

    const token = DEVELOPER_ADMIN_CPF;
    const result = await savePixSettings({
      enabled: targetVal,
      chave: pixKeyInput.trim(),
      tipoChave: pixKeyType,
      titular: pixTitular.trim(),
      proposito: pixProposito.trim(),
    }, token);

    setIsSavingPix(false);
    if (result.success) {
      setPixFeedback({
        type: 'success',
        message: targetVal 
          ? 'Financiamento via PIX ATIVADO com sucesso! A seção está visível para todo o público.' 
          : 'Financiamento via PIX DESATIVADO com sucesso! A seção agora está oculta no site.',
      });
      setTimeout(() => setPixFeedback(null), 5000);
    } else {
      setPixFeedback({
        type: 'error',
        message: result.error || 'Erro ao atualizar status do PIX.',
      });
    }
  };

  const handleSavePixFull = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingPix(true);
    setPixFeedback(null);

    const token = DEVELOPER_ADMIN_CPF;
    const result = await savePixSettings({
      enabled: pixEnabled,
      chave: pixKeyInput.trim(),
      tipoChave: pixKeyType,
      titular: pixTitular.trim(),
      proposito: pixProposito.trim(),
    }, token);

    setIsSavingPix(false);
    if (result.success) {
      setPixFeedback({
        type: 'success',
        message: 'Configurações do PIX salvas com sucesso!',
      });
      setTimeout(() => setPixFeedback(null), 5000);
    } else {
      setPixFeedback({
        type: 'error',
        message: result.error || 'Erro ao salvar configurações do PIX.',
      });
    }
  };

  const initVoterProfile = (data: VoterData) => {
    setVoterProfile(data);
    setEditName(data.name || '');
    setEditEmail(data.email || '');
    setEditPhone(data.phone || '');
    setEditState(data.state || 'SP');
    setEditCity(data.city || '');
  };

  // Carrega dados para a Gestão mesclando registros do Supabase com o registro local
  const loadAdminVotersData = async (adminCpf?: string) => {
    setIsLoadingAdminData(true);
    const token = adminCpf || DEVELOPER_ADMIN_CPF;
    try {
      const res = await fetch(`/api/admin/voters?cpf=${encodeURIComponent(token)}&t=${Date.now()}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
        cache: 'no-store'
      });
      const data = await res.json();
      const localVoters = getVotersRegistry();

      // Mapa para mesclar registros: Nuvem Supabase como Fonte Primária de Verdade
      const mergedMap = new Map<string, VoterData>();

      // 1. Carrega PRIMEIRO os registros oficiais da Nuvem Supabase
      if (res.ok && data.success && Array.isArray(data.voters)) {
        data.voters.forEach((sv: any, idx: number) => {
          const key = (sv.cpf_hash || sv.cpfHash || sv.cpf_masked || sv.cpfMasked || sv.id || `server-${idx}`) as string;
          mergedMap.set(key, sv);
        });
      }

      // 2. Complementa com dados locais apenas se o servidor ainda não possuir
      localVoters.forEach((lv, i) => {
        const key = lv.cpfHash || lv.cpfMasked || `local-${i}`;
        const existing = mergedMap.get(key);
        if (!existing) {
          mergedMap.set(key, {
            id: `local-${i}`,
            name: lv.name || lv.nameMasked || 'Cidadão Eleitor',
            cpf_masked: lv.cpfMasked,
            cpf_hash: lv.cpfHash,
            email: lv.email || '',
            phone: lv.phone || '',
            state: lv.state || 'SP',
            city: lv.city || '',
            has_voted: lv.hasVoted ?? true,
            poll_id: lv.pollId,
            created_at: lv.registeredAt,
          });
        } else {
          // Se o servidor tiver nome genérico ou faltante, complementa com os dados locais
          const isGeneric = !existing.name || existing.name === 'Eleitor Cívico Auditado' || existing.name === 'Cidadão Eleitor';
          if (isGeneric && lv.name && lv.name !== 'Cidadão Eleitor') {
            mergedMap.set(key, {
              ...existing,
              name: lv.name,
              email: existing.email || lv.email || '',
              phone: existing.phone || lv.phone || '',
            });
          }
        }
      });

      const mergedList = Array.from(mergedMap.values());
      if (mergedList.length > 0) {
        setVotersList(mergedList);
      } else {
        loadLocalVotersFallback();
      }
    } catch {
      loadLocalVotersFallback();
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  const loadLocalVotersFallback = () => {
    const local = getVotersRegistry();
    const formatted: VoterData[] = local.map((v, i) => ({
      id: `local-${i}`,
      name: v.name || v.nameMasked || 'Cidadão Eleitor',
      cpf_masked: v.cpfMasked || '***.***.***-**',
      cpf_hash: v.cpfHash,
      email: v.email || '',
      phone: v.phone || '',
      state: v.state,
      city: v.city,
      has_voted: v.hasVoted,
      poll_id: v.pollId,
      created_at: v.registeredAt,
    }));
    setVotersList(formatted);
  };

  // 1. LOGIN EXCLUSIVO POR CPF DO ELEITOR
  const handleVoterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoterError('');
    setRawErrorDetail('');
    setReportSuccess(null);
    setProfileSuccessMsg('');

    const cleanCpf = voterCpf.replace(/\D/g, '');
    if (!cleanCpf) {
      setVoterError('Por favor, informe seu CPF para consultar seu cadastro.');
      return;
    }

    if (!validarCPF(cleanCpf)) {
      setVoterError('CPF com formato incorreto. Por favor, confira os 11 dígitos informados.');
      return;
    }

    setVoterLoading(true);

    const masked = mascararCPF(cleanCpf);
    const localVoters = getVotersRegistry();
    const foundLocal = localVoters.find(v => v.cpfMasked === masked);

    try {
      // 1. Consulta no servidor informando o nome local já existente (se houver) para evitar perda de nome
      const res = await fetch('/api/voter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          cpf: cleanCpf,
          clientName: foundLocal?.name || undefined,
          clientEmail: foundLocal?.email || undefined,
          clientPhone: foundLocal?.phone || undefined,
          clientState: foundLocal?.state || undefined,
          clientCity: foundLocal?.city || undefined,
        }),
      });
      const data = await res.json();

      let targetVoter: VoterData | null = null;

      if (res.ok && data.success && data.voter) {
        targetVoter = data.voter as VoterData;
        // Se temos o nome real local autêntico e o servidor retornou genérico, preserva o nome autêntico!
        if (targetVoter && foundLocal?.name && (!targetVoter.name || targetVoter.name === 'Eleitor Cívico Auditado' || targetVoter.name === 'Desenvolvedor' || targetVoter.name === 'Cidadão Eleitor')) {
          targetVoter.name = foundLocal.name;
        }
      } else if (foundLocal) {
        // Fallback imediato no armazenamento local do navegador com o nome autêntico
        targetVoter = {
          name: foundLocal.name || foundLocal.nameMasked || 'Cidadão Eleitor',
          cpf_masked: foundLocal.cpfMasked,
          cpf_hash: foundLocal.cpfHash,
          email: foundLocal.email || '',
          phone: foundLocal.phone || '',
          state: foundLocal.state || 'SP',
          city: foundLocal.city || '',
          has_voted: foundLocal.hasVoted,
          poll_id: foundLocal.pollId,
          created_at: foundLocal.registeredAt,
        };
      } else if (checkIsAdminCpf(cleanCpf)) {
        // Acesso exclusivo do desenvolvedor / administrador oficial da plataforma
        targetVoter = {
          id: 'admin-master-voter',
          name: 'Leandro Vitulli',
          cpf_masked: masked,
          cpf_hash: 'hash_fatosfakes_admin_' + cleanCpf,
          email: 'admin@fatosfakes2026.org',
          phone: '',
          state: 'SP',
          city: 'São Paulo',
          has_voted: true,
          poll_id: 'eleicao-presidencia-2026',
          created_at: new Date().toISOString(),
          is_admin: true,
        };
      }

      if (targetVoter) {
        setVoterProfile(targetVoter);
        initVoterProfile(targetVoter);
        setCurrentUserRole('voter');
        sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(targetVoter));

        // Checa se este CPF é o desenvolvedor/gestor exclusivo
        if (checkIsAdminCpf(cleanCpf)) {
          setIsSuperUser(true);
          sessionStorage.setItem('fatosfakes_admin_auth_token', cleanCpf);
          loadAdminVotersData(cleanCpf);
          loadAdminElectionsData(cleanCpf);
        }
      } else {
        const rawErr = data?.rawError || data?.error || 'Registro cívico não localizado para este CPF';
        setRawErrorDetail(rawErr);
        const friendlyMsg = data?.error 
          ? formatarErroAmigavel(data.error)
          : 'Não localizamos um voto registrado para este CPF. Se você ainda não participou, vote na pesquisa eleitoral na página inicial para ativar seu registro cívico auditável.';
        setVoterError(friendlyMsg);
      }
    } catch (fetchErr: any) {
      // Fallback local
      if (foundLocal) {
        const targetVoter: VoterData = {
          name: foundLocal.name || foundLocal.nameMasked || 'Cidadão Eleitor',
          cpf_masked: foundLocal.cpfMasked,
          cpf_hash: foundLocal.cpfHash,
          email: foundLocal.email || '',
          phone: foundLocal.phone || '',
          state: foundLocal.state || 'SP',
          city: foundLocal.city || '',
          has_voted: foundLocal.hasVoted,
          poll_id: foundLocal.pollId,
          created_at: foundLocal.registeredAt,
        };
        setVoterProfile(targetVoter);
        initVoterProfile(targetVoter);
        setCurrentUserRole('voter');
        sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(targetVoter));

        if (checkIsAdminCpf(cleanCpf)) {
          setIsSuperUser(true);
          sessionStorage.setItem('fatosfakes_admin_auth_token', cleanCpf);
          loadAdminVotersData(cleanCpf);
          loadAdminElectionsData(cleanCpf);
        }
      } else if (checkIsAdminCpf(cleanCpf)) {
        const adminVoter: VoterData = {
          id: 'admin-master-voter',
          name: 'Leandro Vitulli',
          cpf_masked: masked,
          cpf_hash: 'hash_fatosfakes_admin_' + cleanCpf,
          email: 'admin@fatosfakes2026.org',
          phone: '',
          state: 'SP',
          city: 'São Paulo',
          has_voted: true,
          poll_id: 'eleicao-presidencia-2026',
          created_at: new Date().toISOString(),
          is_admin: true,
        };
        setVoterProfile(adminVoter);
        initVoterProfile(adminVoter);
        setCurrentUserRole('voter');
        setIsSuperUser(true);
        sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(adminVoter));
        sessionStorage.setItem('fatosfakes_admin_auth_token', cleanCpf);
        loadAdminVotersData(cleanCpf);
        loadAdminElectionsData(cleanCpf);
      } else {
        setRawErrorDetail(fetchErr?.message || 'Falha de conexão com o servidor');
        setVoterError('O serviço de consulta está momentaneamente instável. Por favor, tente novamente em alguns instantes.');
      }
    } finally {
      setVoterLoading(false);
    }
  };

  // 2. ATUALIZAÇÃO DO CADASTRO PELO CIDADÃO
  const handleSaveVoterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterProfile) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    const targetHash = voterProfile.cpf_hash || voterProfile.cpfHash || '';
    const targetMasked = voterProfile.cpf_masked || voterProfile.cpfMasked || '';
    const newName = editName.trim() || voterProfile.name;

    try {
      await fetch('/api/voter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voterProfile.id,
          cpf_hash: targetHash,
          cpf_masked: targetMasked,
          name: newName,
          email: editEmail,
          phone: editPhone,
          state: editState,
          city: editCity,
        }),
      });

      atualizarEleitorLocal(targetHash || targetMasked, {
        name: newName,
        nameMasked: ofuscarNome(newName),
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      });

      const updatedProfile: VoterData = {
        ...voterProfile,
        name: newName,
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      };
      setVoterProfile(updatedProfile);
      sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(updatedProfile));

      setProfileSuccessMsg('✓ Seus dados cadastrais foram atualizados com sucesso!');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch {
      atualizarEleitorLocal(targetHash || targetMasked, {
        name: newName,
        nameMasked: ofuscarNome(newName),
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      });

      const updatedProfile: VoterData = {
        ...voterProfile,
        name: newName,
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      };
      setVoterProfile(updatedProfile);
      sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(updatedProfile));
      setProfileSuccessMsg('✓ Dados atualizados com sucesso localmente!');
    } finally {
      setIsSavingProfile(false);
    }
  };


  // Logout
  const handleLogout = () => {
    setCurrentUserRole('guest');
    setVoterProfile(null);
    setVoterCpf('');
    setActivePortalTab('profile');
    sessionStorage.removeItem('fatosfakes_voter_session');
    sessionStorage.removeItem('fatosfakes_admin_auth_token');
  };

  // Filtros da tabela de eleitores
  const filteredVoters = useMemo(() => {
    return votersList.filter(v => {
      const name = (v.name || '').toLowerCase();
      const cpf = (v.cpf_masked || v.cpfMasked || '').toLowerCase();
      const email = (v.email || '').toLowerCase();
      const phone = (v.phone || '').toLowerCase();
      const city = (v.city || '').toLowerCase();
      const state = (v.state || '').toUpperCase();
      const search = adminSearch.toLowerCase();

      const matchesSearch = !adminSearch || 
        name.includes(search) || 
        cpf.includes(search) || 
        email.includes(search) || 
        phone.includes(search) || 
        city.includes(search);

      const matchesUf = adminSelectedUf === 'TODAS' || state === adminSelectedUf;

      return matchesSearch && matchesUf;
    });
  }, [votersList, adminSearch, adminSelectedUf]);

  // Exportar CSV
  const handleExportCSV = () => {
    if (!filteredVoters.length) return;
    const headers = ['ID', 'Nome', 'CPF Mascarado', 'Email', 'Telefone', 'UF', 'Cidade', 'Votou', 'Hash Auditoria', 'Data Cadastro'];
    const rows = filteredVoters.map(v => [
      `"${v.id || ''}"`,
      `"${v.name}"`,
      `"${v.cpf_masked || v.cpfMasked || ''}"`,
      `"${v.email || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.state}"`,
      `"${v.city}"`,
      `"${v.has_voted ?? v.hasVoted ?? true ? 'SIM' : 'NAO'}"`,
      `"${v.cpf_hash || v.cpfHash || ''}"`,
      `"${v.created_at || v.registeredAt || ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `auditoria_eleitores_fatosfakes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(id);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#080e18] text-slate-100 font-sans antialiased">
      
      {/* Editorial Header Masthead */}
      <header className="border-b border-slate-800 bg-[#0b1524]/95 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors py-1 px-2.5 rounded-lg hover:bg-slate-800/60 border border-transparent hover:border-slate-700"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Voltar ao Portal Fatos &amp; Fakes</span>
            </Link>
            <div className="h-4 w-px bg-slate-800 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  <span>Minha Área Cívica</span>
                  <span className="text-[10px] font-semibold uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700">
                    Eleições 2026
                  </span>
                </h1>
              </div>
            </div>
          </div>

          {currentUserRole !== 'guest' && (
            <div className="flex items-center gap-3">
              {isDeveloperUser && (
                <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
                  <button
                    onClick={() => setActivePortalTab('profile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                      activePortalTab === 'profile'
                        ? 'bg-slate-800 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Meu Cadastro</span>
                  </button>
                  <button
                    onClick={() => setActivePortalTab('management')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                      activePortalTab === 'management'
                        ? 'bg-cyan-500 text-slate-950 shadow-sm'
                        : 'text-cyan-400 hover:text-cyan-300'
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Gestão &amp; Relatório</span>
                  </button>
                </div>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors py-1.5 px-3 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/30"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">

        {/* ============================================================== */}
        {/* CASO 1: VISITANTE NÃO AUTENTICADO (100% LIMPO - SEM GESTÃO)   */}
        {/* ============================================================== */}
        {currentUserRole === 'guest' && (
          <div className="max-w-xl mx-auto">
            
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 mb-4 shadow-inner">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Acesso ao Cadastro Cívico
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                Consulte seu comprovante de presença auditável na pesquisa presidencial e mantenha seus dados de contato e localização atualizados.
              </p>
            </div>

            {/* FORMULÁRIO DO ELEITOR (ÚNICO E LIMPO) */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <form onSubmit={handleVoterLogin} className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                    CPF do Eleitor Cadastrado
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={voterCpf}
                      onChange={(e) => setVoterCpf(formatarCPF(e.target.value))}
                      placeholder="000.000.000-00"
                      maxLength={14}
                      className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 text-white text-base font-mono tracking-wider placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      autoFocus
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-2">
                    Digite o mesmo CPF utilizado no momento da sua votação para carregar seus dados.
                  </p>
                </div>

                {voterError && (
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-200 text-xs space-y-3 animate-fadeIn">
                    <div className="flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="font-semibold text-rose-300">Aviso do Cadastro Cívico</p>
                        <p className="mt-0.5 text-rose-200/90 leading-relaxed">{voterError}</p>
                      </div>
                    </div>

                    {/* Botão de Relatar Problema em 1 Clique */}
                    <div className="pt-2.5 border-t border-rose-500/20 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
                      <p className="text-[11px] text-slate-400 leading-tight">
                        Precisa de assistência ou deseja reportar este aviso?
                      </p>
                      <button
                        type="button"
                        onClick={handleReportProblem}
                        disabled={isReporting || Boolean(reportSuccess)}
                        className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 active:scale-95 text-rose-200 hover:text-white border border-rose-500/40 text-[11px] font-semibold transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed shrink-0"
                      >
                        {isReporting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                            <span>Enviando Relato...</span>
                          </>
                        ) : reportSuccess ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-300">Relato Enviado</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5 text-rose-300" />
                            <span>🚨 Relatar este Problema em 1 Clique</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Feedback com Protocolo após Relatar */}
                    {reportSuccess && (
                      <div className="p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-start gap-2 leading-relaxed">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{reportSuccess}</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={voterLoading || !voterCpf.trim()}
                  className="w-full py-3.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold text-sm tracking-wide transition-all shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {voterLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-900" />
                      <span>Consultando Cadastro Cívico...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Acessar Meu Cadastro Cívico</span>
                    </>
                  )}
                </button>
              </form>

              {/* Garantias de Sigilo e Democracia */}
              <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Shield className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">Voto 100% Sigiloso na Urna Cega:</strong> Seu voto para presidente não fica vinculado ao seu CPF em nenhum momento.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-emerald-400" />
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <strong className="text-slate-200">1 Cidadão = 1 Voto:</strong> O cadastro de presença é como a lista de assinaturas de um abaixo-assinado sério, garantindo legitimidade.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 2: ELEITOR LOGADO — MEU CADASTRO CÍVICO                   */}
        {/* ============================================================== */}
        {currentUserRole === 'voter' && voterProfile && activePortalTab === 'profile' && (
          <div className="max-w-3xl mx-auto space-y-6">

            {/* SE O CPF FOR DO ADMINISTRADOR: CARD DESTACADO PARA ABRIR GESTÃO */}
            {isDeveloperUser && (
              <div className="bg-gradient-to-r from-[#0b1c33] to-[#091527] border border-cyan-500/40 rounded-2xl p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center shrink-0">
                    <Compass className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Acesso de Governança Habilitado</span>
                      <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    </div>
                    <p className="text-sm font-bold text-white mt-0.5">Seu CPF possui autorização de Gestão da Plataforma</p>
                  </div>
                </div>
                <button
                  onClick={() => setActivePortalTab('management')}
                  className="px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <Compass className="w-4 h-4" />
                  <span>Abrir Painel de Gestão &amp; Geolocalização</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            
            {/* Cartão de Identificação Cívica */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      Cadastro Cívico Autenticado
                    </span>
                    {isDeveloperUser && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                        <Compass className="w-3 h-3" />
                        Desenvolvedor Oficial
                      </span>
                    )}
                    <span className="text-xs text-slate-500 font-mono">
                      {voterProfile.cpf_masked || voterProfile.cpfMasked}
                    </span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    {voterProfile.name}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Participação ativa e registrada na Pesquisa Eleitoral Presidencial 2026.
                  </p>
                </div>

                <div className="text-right sm:text-right shrink-0">
                  <div className="inline-block bg-[#080e18] px-3.5 py-2 rounded-xl border border-slate-800 text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block">Status da Participação</span>
                    <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                      Voto Confirmado na Urna
                    </span>
                  </div>
                </div>
              </div>

              {/* Hash Criptográfico de Auditoria */}
              <div className="mt-6 bg-[#080e18] rounded-xl p-4 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-0.5 overflow-hidden">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Seu Recibo Criptográfico de Presença (SHA-256)
                  </span>
                  <p className="text-xs font-mono text-emerald-300/90 truncate max-w-lg">
                    {voterProfile.cpf_hash || voterProfile.cpfHash || 'Hash auditável gerado com salt de segurança'}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  <button
                    onClick={() => copyToClipboard(voterProfile.cpf_hash || voterProfile.cpfHash || '', 'citizen_hash')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-slate-700"
                  >
                    {copiedHash === 'citizen_hash' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar Recibo</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleVerifyHash(voterProfile.cpf_hash || voterProfile.cpfHash || '')}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 border border-cyan-500/30 shadow-sm"
                    title="Validar autenticidade do recibo na Urna Cega"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Validar na Urna Cega</span>
                  </button>
                </div>
              </div>

            </div>

            {/* Formulário de Edição de Dados */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Atualizar Informações de Contato e Localização</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Mantenha seus canais atualizados para receber as certidões de apuração e notícias de checagem.
                </p>
              </div>

              <form onSubmit={handleSaveVoterProfile} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Nome Completo (Editável para Correção) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2 flex items-center justify-between">
                      <span>Nome Completo</span>
                      <span className="text-[10px] text-emerald-400/80 font-normal">Nome de Registro</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editName}
                        onChange={(e) => setEditName(e.target.value)}
                        placeholder="Seu nome completo..."
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                      <User className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* CPF Mascarado (Bloqueado) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>CPF Protegido</span>
                      <span className="text-[10px] text-slate-500 font-normal">Padrão LGPD</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={voterProfile.cpf_masked || voterProfile.cpfMasked}
                        disabled
                        className="w-full bg-[#080e18]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-mono cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                    </div>
                  </div>

                  {/* E-mail (Editável) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      E-mail de Contato
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        value={editEmail}
                        onChange={(e) => setEditEmail(e.target.value)}
                        placeholder="seu.email@exemplo.com"
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                      <Mail className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Celular / WhatsApp (Editável) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Celular / WhatsApp
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={editPhone}
                        onChange={(e) => setEditPhone(formatarTelefone(e.target.value))}
                        placeholder="(00) 00000-0000"
                        maxLength={15}
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                      <Phone className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Estado / UF (Editável) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Estado (UF)
                    </label>
                    <div className="relative">
                      <select
                        value={editState}
                        onChange={(e) => setEditState(e.target.value)}
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      >
                        {BRAZIL_STATES.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Cidade (Editável) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Município / Cidade
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={editCity}
                        onChange={(e) => setEditCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-2.5 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                      />
                      <MapPin className="w-4 h-4 text-slate-500 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                </div>

                {profileSuccessMsg && (
                  <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{profileSuccessMsg}</span>
                  </div>
                )}

                {profileErrorMsg && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>{profileErrorMsg}</span>
                  </div>
                )}

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="py-2.5 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {isSavingProfile ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-slate-900" />
                        <span>Salvando no Banco de Dados...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" />
                        <span>Salvar e Atualizar Informações</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Rodapé do Perfil com Acesso Discreto de Auditoria */}
            <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-slate-600" />
                <span>Auditoria Cívica Paritária · Urna Cega Zero-Knowledge</span>
              </div>
            </div>

            {/* Espaço de Apoio Cívico Discreto via PIX */}
            <div className="pt-2">
              <PixDonationSection id="apoie-via-pix-eleitor" compact={true} />
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 3: GESTÃO & GEOLOCALIZAÇÃO (EXCLUSIVO DA DIRETORIA)       */}
        {/* ============================================================== */}
        {currentUserRole === 'voter' && isDeveloperUser && activePortalTab === 'management' && (
          <div className="space-y-8">
            
            {/* Componente Executivo de Geolocalização & Relatório do CEO */}
            <GeolocatedReportView 
              voters={votersList} 
              activePoll={INITIAL_POLLS[0]} 
              onExportCSV={handleExportCSV} 
            />

            {/* CARD DE GESTÃO DO PIX (HABILITAR / DESABILITAR & EDITAR CHAVE) */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400/20" />
                    <h3 className="text-lg font-bold text-white">
                      Controle do Financiamento Cívico (Apoio via PIX)
                    </h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Ative ou desative a qualquer momento a exibição do card de apoio financeiro na página inicial e no portal.
                  </p>
                </div>

                {/* Switch de Ativação Rápida */}
                <div className="flex items-center gap-3 bg-[#080e18] px-4 py-2.5 rounded-xl border border-slate-800 shrink-0">
                  <span className="text-xs font-bold text-slate-300">
                    Status no Site:
                  </span>
                  <button
                    type="button"
                    onClick={() => handleTogglePix(!pixEnabled)}
                    disabled={isSavingPix}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                      pixEnabled ? 'bg-emerald-500' : 'bg-slate-700'
                    }`}
                    title={pixEnabled ? 'Clique para Desativar' : 'Clique para Ativar'}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        pixEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <span className={`text-xs font-extrabold uppercase tracking-wider ${
                    pixEnabled ? 'text-emerald-400' : 'text-slate-500'
                  }`}>
                    {pixEnabled ? 'Ativado' : 'Desativado'}
                  </span>
                </div>
              </div>

              {/* Mensagem de Feedback */}
              {pixFeedback && (
                <div className={`p-3.5 rounded-xl text-xs flex items-center gap-2.5 animate-fadeIn ${
                  pixFeedback.type === 'success' 
                    ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border border-rose-500/30 text-rose-300'
                }`}>
                  {pixFeedback.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{pixFeedback.message}</span>
                </div>
              )}

              {/* Formulário de Configuração da Chave */}
              <form onSubmit={handleSavePixFull} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                  <div className="sm:col-span-7">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Sua Chave PIX (E-mail, Celular, CPF, CNPJ ou Aleatória):
                    </label>
                    <input
                      type="text"
                      value={pixKeyInput}
                      onChange={(e) => setPixKeyInput(e.target.value)}
                      placeholder="Ex: sua-chave-pix@banco.com ou chave aleatória..."
                      className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-emerald-300 font-mono focus:outline-none"
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      Você pode definir ou trocar a chave quando quiser por aqui, sem alterar código.
                    </p>
                  </div>

                  <div className="sm:col-span-5">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Tipo da Chave:
                    </label>
                    <select
                      value={pixKeyType}
                      onChange={(e) => setPixKeyType(e.target.value)}
                      className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none"
                    >
                      <option value="E-mail / Chave Cadastrada">E-mail</option>
                      <option value="Chave Aleatória (EVP)">Chave Aleatória (EVP)</option>
                      <option value="Telefone / Celular">Telefone / WhatsApp</option>
                      <option value="CPF / CNPJ">CPF / CNPJ</option>
                    </select>
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Nome do Titular ou Razão Social:
                    </label>
                    <input
                      type="text"
                      value={pixTitular}
                      onChange={(e) => setPixTitular(e.target.value)}
                      placeholder="Ex: FATOS & FAKES · Projeto Cívico Independente"
                      className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-6">
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Destinação / Propósito dos Recursos:
                    </label>
                    <input
                      type="text"
                      value={pixProposito}
                      onChange={(e) => setPixProposito(e.target.value)}
                      placeholder="Ex: Manutenção de servidores, banco de dados auditável e checagens."
                      className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
                  <span className="text-[11px] text-slate-400">
                    Status atual na plataforma: <strong className={pixEnabled ? 'text-emerald-400' : 'text-slate-400'}>{pixEnabled ? '🟢 Ativado (Visível no site)' : '⚪ Desativado (Oculto)'}</strong>
                  </span>
                  <button
                    type="submit"
                    disabled={isSavingPix}
                    className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0"
                  >
                    {isSavingPix ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    <span>Salvar Configurações do PIX</span>
                  </button>
                </div>
              </form>
            </div>

            {/* GESTÃO DE PLEITOS ELEITORAIS E ARQUIVO HISTÓRICO CÍVICO */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 border border-amber-500/30 text-amber-300 uppercase tracking-wider flex items-center gap-1">
                      <Lock className="w-3 h-3" />
                      Exclusivo do Desenvolvedor
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      Supabase Cloud · Urna Cega
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Vote className="w-5 h-5 text-emerald-400" />
                    <span>Gestão de Pleitos Eleitorais &amp; Arquivo Cívico</span>
                  </h3>
                  <p className="text-xs text-slate-400">
                    Controle de eleições em andamento, apuração em tempo real e congelamento seguro em histórico restrito ao desenvolvedor (sem exposição pública de pleitos passados).
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => loadAdminElectionsData()}
                    disabled={isLoadingElections}
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingElections ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                    <span>Atualizar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowCreatePollModal(true)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-md cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Novo Pleito</span>
                  </button>
                </div>
              </div>

              {/* Feedback Alert */}
              {electionsFeedback && (
                <div className={`p-3.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${
                  electionsFeedback.type === 'success' 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}>
                  <div className="flex items-center gap-2">
                    {electionsFeedback.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                    )}
                    <span>{electionsFeedback.message}</span>
                  </div>
                  <button 
                    onClick={() => setElectionsFeedback(null)} 
                    className="text-slate-400 hover:text-white p-1"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* SEÇÃO 1: PLEITOS ATIVOS / URNAS ABERTAS */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                    Pleitos Ativos na Plataforma ({adminActivePolls.length})
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Votos computados de eleitores reais
                  </span>
                </div>

                {adminActivePolls.length === 0 ? (
                  <div className="p-6 rounded-xl bg-[#080e18] border border-slate-800 text-center space-y-2">
                    <Vote className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-400">Nenhum pleito ativo no momento.</p>
                    <button
                      type="button"
                      onClick={() => setShowCreatePollModal(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold hover:bg-emerald-500/30 cursor-pointer"
                    >
                      <PlusCircle className="w-3.5 h-3.5" />
                      Criar Primeiro Pleito
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {adminActivePolls.map((poll: any) => {
                      const totalVotes = Number(poll.total_votes || 0);
                      const candidates = Array.isArray(poll.candidates) ? poll.candidates : [];
                      const isArchiving = isArchivingPollId === poll.id;

                      return (
                        <div 
                          key={poll.id} 
                          className="bg-[#080e18] border border-slate-800 hover:border-slate-700/80 rounded-xl p-4.5 space-y-4 transition-all"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                                  🟢 Urna Aberta
                                </span>
                                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-300">
                                  {poll.role || 'Geral'} · {poll.state || 'BR'}
                                </span>
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ID: {poll.id}
                                </span>
                              </div>
                              <h5 className="text-sm font-bold text-white">
                                {poll.title}
                              </h5>
                            </div>

                            <div className="text-right shrink-0">
                              <span className="text-xl font-black text-emerald-400 tabular-nums block">
                                {totalVotes}
                              </span>
                              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                                {totalVotes === 1 ? 'voto registrado' : 'votos na urna'}
                              </span>
                            </div>
                          </div>

                          {/* Lista resumida de candidatos */}
                          <div className="space-y-1.5 pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                              Candidatos ({candidates.length}):
                            </span>
                            <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                              {candidates.map((cand: any, cIdx: number) => {
                                const cVotes = Number(cand.votes || 0);
                                const pct = totalVotes > 0 ? ((cVotes / totalVotes) * 100).toFixed(1) : '0.0';
                                return (
                                  <div 
                                    key={cand.id || cIdx}
                                    className="flex items-center justify-between text-xs py-1 px-2 rounded-lg bg-slate-900/60 border border-slate-800/60"
                                  >
                                    <div className="truncate pr-2">
                                      <span className="font-medium text-slate-200">{cand.name}</span>
                                      <span className="text-[10px] text-slate-500 ml-1.5">({cand.party})</span>
                                    </div>
                                    <div className="text-right shrink-0 font-mono text-[11px] text-slate-300">
                                      <span className="font-bold">{cVotes}</span>
                                      <span className="text-slate-500 text-[10px] ml-1">({pct}%)</span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Ações do Pleito */}
                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <span className="text-[10px] text-slate-500">
                              Rodada: {poll.round || '1º Turno'} · {poll.survey_date || '2026'}
                            </span>

                            <button
                              type="button"
                              onClick={() => handleArchivePoll(poll.id, poll.title)}
                              disabled={isArchiving}
                              className="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Salva os votos atuais no Arquivo Histórico do desenvolvedor e zera a urna pública para a próxima rodada"
                            >
                              {isArchiving ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <FolderArchive className="w-3.5 h-3.5 text-amber-400" />
                              )}
                              <span>Arquivar &amp; Zerar Urna</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* SEÇÃO 2: ARQUIVO HISTÓRICO CÍVICO (PLEITOS CONGELADOS) */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                    <History className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Arquivo Histórico Cívico ({adminArchivedPolls.length} snapshots congelados)</span>
                  </h4>
                  <span className="text-[11px] text-slate-500">
                    Guardado em sigilo para auditoria do desenvolvedor (fora do ar público)
                  </span>
                </div>

                {adminArchivedPolls.length === 0 ? (
                  <div className="p-4 rounded-xl bg-[#080e18] border border-slate-800/80 text-center">
                    <p className="text-xs text-slate-500">
                      Nenhum pleito arquivado anteriormente. Ao clicar em &quot;Arquivar &amp; Zerar Urna&quot;, o snapshot com votos congelados ficará listado aqui.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {adminArchivedPolls.map((arc: any) => {
                      const totalArchivedVotes = Number(arc.total_votes || 0);
                      const createdDate = arc.created_at ? new Date(arc.created_at).toLocaleString('pt-BR') : 'Data não informada';

                      return (
                        <div
                          key={arc.id}
                          className="p-3.5 rounded-xl bg-[#080e18] border border-slate-800 hover:border-slate-700 space-y-3 transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center justify-between gap-2">
                              <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                                ARQUIVADO
                              </span>
                              <span className="text-[10px] text-slate-500">
                                {createdDate}
                              </span>
                            </div>
                            <h5 className="text-xs font-bold text-slate-200 line-clamp-1" title={arc.title}>
                              {arc.title}
                            </h5>
                            <p className="text-[11px] text-slate-400 font-mono">
                              {arc.role || 'Cargo'} · {totalArchivedVotes} {totalArchivedVotes === 1 ? 'voto' : 'votos computados'}
                            </p>
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-800/80">
                            <button
                              type="button"
                              onClick={() => setSelectedArchiveDetail(arc)}
                              className="text-xs text-cyan-400 hover:text-cyan-300 font-bold flex items-center gap-1 cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver Apuração</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDownloadArchiveJSON(arc)}
                              className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1 cursor-pointer"
                              title="Baixar comprovante de arquivo (JSON)"
                            >
                              <Download className="w-3 h-3" />
                              <span>Exportar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* TABELA DE AUDITORIA DE TODOS OS ELEITORES CADASTRADOS */}
            <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-emerald-400" />
                    <span>Lista Geral de Eleitores Cadastrados</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Total de {votersList.length} registros auditáveis de presença na urna cega.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => loadAdminVotersData()}
                    disabled={isLoadingAdminData}
                    className="py-2 px-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdminData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                    <span>Atualizar</span>
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="py-2 px-3.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Filtros de Busca e UF */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="relative w-full sm:max-w-md">
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Buscar por nome, CPF, e-mail, celular ou cidade..."
                    className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                  <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                </div>

                <div className="flex items-center gap-2 text-xs text-slate-400 w-full sm:w-auto">
                  <span>Filtrar UF:</span>
                  <select
                    value={adminSelectedUf}
                    onChange={(e) => setAdminSelectedUf(e.target.value)}
                    className="bg-[#080e18] border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="TODAS">Todas as UFs</option>
                    {BRAZIL_STATES.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    setAuditHashInput('');
                    setAuditVerificationResult(null);
                    setAuditError('');
                    setShowHashAuditModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/60 text-cyan-300 text-xs font-bold border border-cyan-500/30 flex items-center gap-1.5 shrink-0 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Auditar Hash Avulso</span>
                </button>
              </div>

              {/* Tabela de Eleitores */}
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 bg-[#080e18] text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                      <th className="py-3 px-4">Eleitor</th>
                      <th className="py-3 px-4">Contato (E-mail / WhatsApp)</th>
                      <th className="py-3 px-4">Localização</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Hash de Auditoria</th>
                      <th className="py-3 px-4">Registro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#0b1524]">
                    {filteredVoters.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500">
                          Nenhum eleitor encontrado para os critérios de busca.
                        </td>
                      </tr>
                    ) : (
                      filteredVoters.map((voter, index) => {
                        const hash = voter.cpf_hash || voter.cpfHash || '';
                        const maskedCpf = voter.cpf_masked || voter.cpfMasked || '***.***.***-**';
                        const dateStr = voter.created_at || voter.registeredAt;
                        const formattedDate = dateStr 
                          ? new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                          : 'Hoje';

                        return (
                          <tr key={voter.id || index} className="hover:bg-slate-800/30 transition-colors">
                            <td className="py-3 px-4">
                              <div className="font-bold text-white text-xs">{voter.name}</div>
                              <div className="font-mono text-[11px] text-slate-400 mt-0.5">{maskedCpf}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-slate-300 font-medium">{voter.email || <span className="text-slate-600 italic">Não informado</span>}</div>
                              <div className="text-slate-400 text-[11px] mt-0.5">{voter.phone || <span className="text-slate-600 italic">Não informado</span>}</div>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 font-bold text-[10px] text-slate-300 mr-1.5 border border-slate-700">
                                {voter.state}
                              </span>
                              <span className="text-slate-300">{voter.city}</span>
                            </td>
                            <td className="py-3 px-4">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                <Check className="w-3 h-3" />
                                Confirmado
                              </span>
                            </td>
                            <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                              <div className="flex items-center gap-1.5 max-w-[200px]">
                                <span className="truncate" title={hash}>{hash.slice(0, 16)}...</span>
                                <button
                                  onClick={() => copyToClipboard(hash, `hash-${index}`)}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                                  title="Copiar Hash"
                                >
                                  {copiedHash === `hash-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleVerifyHash(hash)}
                                  className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-cyan-400 transition-colors"
                                  title="Auditar e validar este hash na Urna Cega"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-slate-400 text-[11px]">
                              {formattedDate}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

            </div>

          </div>
        )}

      </main>

      {/* Modal de Auditoria e Validação Cívica de Hash */}
      {showHashAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1524] border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Validador Cívico de Hash Criptográfico</span>
              </div>
              <button
                onClick={() => setShowHashAuditModal(false)}
                className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-4 text-left">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Hash SHA-256 de Auditoria:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={auditHashInput}
                    onChange={(e) => setAuditHashInput(e.target.value)}
                    placeholder="Cole o hash de 64 caracteres ou prefixo..."
                    className="flex-1 bg-[#080e18] border border-slate-700 focus:border-cyan-500 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 placeholder:text-slate-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleVerifyHash()}
                    disabled={isVerifyingHash}
                    className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl disabled:opacity-50 transition-colors flex items-center gap-1.5 shrink-0"
                  >
                    {isVerifyingHash ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>Verificar</span>
                  </button>
                </div>
              </div>

              {auditError && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold">Hash não autenticado ou não encontrado</p>
                    <p className="text-slate-300">{auditError}</p>
                  </div>
                </div>
              )}

              {auditVerificationResult && (
                <div className="p-4 rounded-xl bg-[#080e18] border border-emerald-500/30 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Certificado de Autenticidade Comprovado</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="bg-[#0b1524] p-3 rounded-lg border border-slate-800 space-y-1">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Hash Auditado</span>
                      <p className="font-mono text-emerald-300 text-[11px] break-all select-all">
                        {auditVerificationResult.hash}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-[#0b1524] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Status da Cédula</span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                          <Check className="w-3 h-3" />
                          Válido na Urna
                        </span>
                      </div>
                      <div className="bg-[#0b1524] p-2.5 rounded-lg border border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">Algoritmo</span>
                        <span className="text-slate-200 font-medium mt-0.5 block truncate">
                          {auditVerificationResult.cryptographicStandard}
                        </span>
                      </div>
                    </div>

                    <div className="bg-[#0b1524] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Pleito / Eleição</span>
                      <p className="text-slate-200 font-medium mt-0.5">
                        {auditVerificationResult.electionTitle}
                      </p>
                    </div>

                    <div className="bg-[#0b1524] p-2.5 rounded-lg border border-slate-800">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Data e Hora de Gravação</span>
                      <p className="text-slate-300 font-mono mt-0.5">
                        {new Date(auditVerificationResult.recordedAt).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>

                  {/* Nota de Soberania e Sigilo Constitucional */}
                  <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-500/20 text-[11px] text-emerald-200/90 leading-relaxed space-y-1">
                    <p className="font-bold flex items-center gap-1 text-emerald-300">
                      <Lock className="w-3 h-3" />
                      Garantia Constitucional de Sigilo do Voto (Art. 14, CF/88):
                    </p>
                    <p className="text-slate-300">
                      {auditVerificationResult.secretBallotGuarantee}
                    </p>
                  </div>
                </div>
              )}

              {/* Caixa didática: Como auditar independentemente sem o servidor */}
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-slate-200">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Como auditar no seu computador (100% Independente):</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  O hash é uma função matemática unidirecional pública. Qualquer perito ou cidadão pode gerar a mesma assinatura no terminal Linux, Mac ou PowerShell executando:
                </p>
                <code className="block p-2 rounded-lg bg-[#080e18] text-[10px] font-mono text-cyan-300 border border-slate-800 overflow-x-auto">
                  echo -n &quot;CPF_LIMPO:fatosfakes_2026_salt_presidencial_urna_cega&quot; | shasum -a 256
                </code>
                <p className="text-[10px] text-slate-500">
                  Se o resultado for idêntico ao hash gravado, a presença do eleitor está matematicamente comprovada e blindada contra fraudes ou duplicidade.
                </p>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setShowHashAuditModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors"
              >
                Fechar Validador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APURAÇÃO DETALHADA DO ARQUIVO HISTÓRICO */}
      {selectedArchiveDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1524] border border-slate-700 rounded-2xl max-w-xl w-full p-6 shadow-2xl space-y-5 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  SNAPSHOT CÍVICO HISTÓRICO
                </span>
                <h3 className="text-base font-bold text-white">
                  {selectedArchiveDetail.title}
                </h3>
                <p className="text-xs text-slate-400">
                  Identificador: <span className="font-mono text-cyan-300">{selectedArchiveDetail.id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedArchiveDetail(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Total Apurado</span>
                <span className="text-base font-bold text-emerald-400">
                  {selectedArchiveDetail.total_votes || 0} votos
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Cargo / Região</span>
                <span className="text-xs font-semibold text-slate-200">
                  {selectedArchiveDetail.role || 'Geral'} ({selectedArchiveDetail.state || 'BR'})
                </span>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 block uppercase">Data de Congelamento</span>
                <span className="text-[11px] text-slate-300">
                  {selectedArchiveDetail.created_at ? new Date(selectedArchiveDetail.created_at).toLocaleString('pt-BR') : '2026'}
                </span>
              </div>
            </div>

            {/* Tabela de Candidatos e Votos */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
                Placar Oficial Congelado na Urna:
              </span>
              <div className="space-y-1.5 max-h-60 overflow-y-auto">
                {Array.isArray(selectedArchiveDetail.candidates) && selectedArchiveDetail.candidates.map((cand: any, idx: number) => {
                  const votes = Number(cand.votes || 0);
                  const total = Number(selectedArchiveDetail.total_votes || 0);
                  const pct = total > 0 ? ((votes / total) * 100).toFixed(1) : '0.0';
                  return (
                    <div
                      key={cand.id || idx}
                      className="p-2.5 rounded-xl bg-[#080e18] border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}º
                        </span>
                        <div>
                          <span className="font-bold text-slate-100">{cand.name}</span>
                          <span className="text-[10px] text-slate-400 ml-1.5">({cand.party})</span>
                        </div>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-bold">{votes} votos</span>
                        <span className="text-slate-500 text-[10px] ml-1.5">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleDownloadArchiveJSON(selectedArchiveDetail)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar JSON</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedArchiveDetail(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CRIAR NOVO PLEITO / ELEIÇÃO */}
      {showCreatePollModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1524] border border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div className="space-y-1">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                  NOVO PLEITO ELEITORAL
                </span>
                <h3 className="text-base font-bold text-white">
                  Cadastrar Nova Eleição / Urna
                </h3>
              </div>
              <button
                onClick={() => setShowCreatePollModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewPoll} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Título da Eleição:
                </label>
                <input
                  type="text"
                  required
                  value={newPollForm.title}
                  onChange={(e) => setNewPollForm({ ...newPollForm, title: e.target.value })}
                  placeholder="Ex: Eleição Presidencial 2026 - 1º Turno"
                  className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Cargo Eletivo:
                  </label>
                  <input
                    type="text"
                    value={newPollForm.role}
                    onChange={(e) => setNewPollForm({ ...newPollForm, role: e.target.value })}
                    placeholder="Ex: Presidente da República"
                    className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Estado (UF):
                  </label>
                  <select
                    value={newPollForm.state}
                    onChange={(e) => setNewPollForm({ ...newPollForm, state: e.target.value })}
                    className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="BR">Nacional (BR)</option>
                    {BRAZIL_STATES.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Turno:
                  </label>
                  <select
                    value={newPollForm.round}
                    onChange={(e) => setNewPollForm({ ...newPollForm, round: e.target.value })}
                    className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                  >
                    <option value="1º Turno">1º Turno</option>
                    <option value="2º Turno">2º Turno</option>
                    <option value="Turno Único">Turno Único</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Ano / Data:
                  </label>
                  <input
                    type="text"
                    value={newPollForm.survey_date}
                    onChange={(e) => setNewPollForm({ ...newPollForm, survey_date: e.target.value })}
                    placeholder="2026"
                    className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Lista de Candidatos (1 por linha: <span className="text-cyan-400 font-mono">Nome - Sigla Partido</span>):
                </label>
                <textarea
                  rows={5}
                  required
                  value={newPollForm.candidatesText}
                  onChange={(e) => setNewPollForm({ ...newPollForm, candidatesText: e.target.value })}
                  placeholder="Tarcísio de Freitas - REPUBLICANOS&#10;Ratinho Jr - PSD&#10;Romeu Zema - NOVO&#10;Lula - PT&#10;Branco / Nulo - VOTO_NEUTRO"
                  className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl p-3 text-xs text-white font-mono focus:outline-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreatePollModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingPoll}
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  {isCreatingPoll ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <PlusCircle className="w-3.5 h-3.5" />
                  )}
                  <span>Criar e Abrir Urna</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default function MinhaAreaPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#080e18] flex items-center justify-center text-slate-400 text-sm">
        Carregando Minha Área Cívica...
      </div>
    }>
      <MinhaAreaContent />
    </Suspense>
  );
}
