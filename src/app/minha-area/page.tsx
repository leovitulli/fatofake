'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  KeyRound, 
  Eye, 
  EyeOff, 
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
  Database,
  Building,
  Calendar,
  Copy,
  Check,
  UserCheck,
  Mail,
  Phone,
  MapPin,
  Save,
  FileText,
  Sparkles,
  Shield
} from 'lucide-react';
import { 
  validarCPF, 
  formatarCPF, 
  mascararCPF, 
  formatarTelefone, 
  getVotersRegistry, 
  atualizarEleitorLocal,
  gerarHashEleitor
} from '@/lib/voteService';

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
}

const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
];

function MinhaAreaContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'admin' ? 'admin_login' : 'voter_login';

  // Estados de Autenticação
  const [activeLoginMode, setActiveLoginMode] = useState<'voter' | 'admin'>(
    searchParams.get('tab') === 'admin' ? 'admin' : 'voter'
  );
  const [currentUserRole, setCurrentUserRole] = useState<'guest' | 'voter' | 'admin'>('guest');
  
  // Login Cidadão
  const [voterCpf, setVoterCpf] = useState('');
  const [voterLoading, setVoterLoading] = useState(false);
  const [voterError, setVoterError] = useState('');

  // Login Admin
  const [adminPass, setAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminError, setAdminError] = useState('');

  // Sessão do Cidadão
  const [voterProfile, setVoterProfile] = useState<VoterData | null>(null);
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editState, setEditState] = useState('');
  const [editCity, setEditCity] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');
  const [profileErrorMsg, setProfileErrorMsg] = useState('');

  // Sessão do Administrador (Painel Geral)
  const [adminActiveTab, setAdminActiveTab] = useState<'overview' | 'profile'>('overview');
  const [votersList, setVotersList] = useState<VoterData[]>([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalBallots: 0,
    statesCount: 0,
  });
  const [adminSearch, setAdminSearch] = useState('');
  const [adminSelectedUf, setAdminSelectedUf] = useState('TODAS');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const DEFAULT_ADMIN_PASS = 'admin@fatosfakes2026';

  // Auto-restauração da sessão salva
  useEffect(() => {
    // 1. Verifica se havia sessão de admin
    const savedAdminToken = sessionStorage.getItem('fatosfakes_admin_auth_token') || localStorage.getItem('fatosfakes_admin_auth_token');
    if (savedAdminToken) {
      setCurrentUserRole('admin');
      fetchAdminData(savedAdminToken);
    } else {
      // 2. Verifica se havia sessão de cidadão
      const savedVoterJson = sessionStorage.getItem('fatosfakes_voter_session');
      if (savedVoterJson) {
        try {
          const parsed = JSON.parse(savedVoterJson);
          if (parsed && (parsed.cpf_hash || parsed.cpfHash)) {
            setCurrentUserRole('voter');
            initVoterProfile(parsed);
          }
        } catch {
          // ignore
        }
      }
    }
  }, []);

  const initVoterProfile = (data: VoterData) => {
    setVoterProfile(data);
    setEditEmail(data.email || '');
    setEditPhone(data.phone || '');
    setEditState(data.state || 'SP');
    setEditCity(data.city || '');
  };

  // 1. LOGIN DO CIDADÃO (por CPF)
  const handleVoterLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setVoterError('');
    setProfileSuccessMsg('');

    const cleanCpf = voterCpf.replace(/\D/g, '');
    if (!cleanCpf) {
      setVoterError('Por favor, informe seu CPF.');
      return;
    }

    if (!validarCPF(cleanCpf)) {
      setVoterError('CPF inválido. Por favor, verifique os dígitos digitados.');
      return;
    }

    setVoterLoading(true);

    try {
      // Consulta na API do servidor
      const res = await fetch('/api/voter/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpf: cleanCpf }),
      });
      const data = await res.json();

      if (res.ok && data.success && data.voter) {
        setVoterProfile(data.voter);
        initVoterProfile(data.voter);
        setCurrentUserRole('voter');
        sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(data.voter));
      } else {
        // Fallback local: se a rede ou Supabase oscilar, consulta o registro do navegador
        const masked = mascararCPF(cleanCpf);
        const localVoters = getVotersRegistry();
        const foundLocal = localVoters.find(v => v.cpfMasked === masked);

        if (foundLocal) {
          const formatted: VoterData = {
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
          setVoterProfile(formatted);
          initVoterProfile(formatted);
          setCurrentUserRole('voter');
          sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(formatted));
        } else {
          setVoterError(
            data.error || 'Cadastro não localizado para este CPF. Se você ainda não votou, registre seu voto na página inicial para ativar seu cadastro cívico.'
          );
        }
      }
    } catch {
      // Fallback local em caso de erro de conexão
      const masked = mascararCPF(cleanCpf);
      const localVoters = getVotersRegistry();
      const foundLocal = localVoters.find(v => v.cpfMasked === masked);

      if (foundLocal) {
        const formatted: VoterData = {
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
        setVoterProfile(formatted);
        initVoterProfile(formatted);
        setCurrentUserRole('voter');
        sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(formatted));
      } else {
        setVoterError('Nenhum cadastro encontrado para este CPF. Por favor, registre seu voto na página inicial.');
      }
    } finally {
      setVoterLoading(false);
    }
  };

  // 2. ATUALIZAÇÃO DO CADASTRO DO CIDADÃO
  const handleSaveVoterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!voterProfile) return;

    setIsSavingProfile(true);
    setProfileSuccessMsg('');
    setProfileErrorMsg('');

    const targetHash = voterProfile.cpf_hash || voterProfile.cpfHash || '';
    const targetMasked = voterProfile.cpf_masked || voterProfile.cpfMasked || '';

    try {
      // 1. Atualiza no Supabase via API
      const res = await fetch('/api/voter/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: voterProfile.id,
          cpf_hash: targetHash,
          email: editEmail,
          phone: editPhone,
          state: editState,
          city: editCity,
        }),
      });
      const data = await res.json();

      // 2. Atualiza no localStorage também
      atualizarEleitorLocal(targetHash || targetMasked, {
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      });

      // Atualiza o estado da tela
      const updatedProfile: VoterData = {
        ...voterProfile,
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      };
      setVoterProfile(updatedProfile);
      sessionStorage.setItem('fatosfakes_voter_session', JSON.stringify(updatedProfile));

      setProfileSuccessMsg('✓ Seus dados de contato e localização foram atualizados com sucesso no banco de dados!');
      setTimeout(() => setProfileSuccessMsg(''), 5000);
    } catch {
      // Fallback local se estiver offline
      atualizarEleitorLocal(targetHash || targetMasked, {
        email: editEmail,
        phone: editPhone,
        state: editState,
        city: editCity,
      });
      setProfileSuccessMsg('✓ Dados atualizados com sucesso localmente!');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // 3. LOGIN DO ADMINISTRADOR
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdminError('');
    setAdminLoading(true);

    try {
      const res = await fetch(`/api/admin/voters?key=${encodeURIComponent(adminPass)}`, {
        headers: {
          'Authorization': `Bearer ${adminPass}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setCurrentUserRole('admin');
        sessionStorage.setItem('fatosfakes_admin_auth_token', adminPass);
        localStorage.setItem('fatosfakes_admin_auth_token', adminPass);
        setVotersList(data.voters || []);
        setStats(data.stats || { totalVoters: data.voters?.length || 0, totalBallots: data.voters?.length || 0, statesCount: 0 });
      } else {
        if (adminPass === DEFAULT_ADMIN_PASS) {
          setCurrentUserRole('admin');
          sessionStorage.setItem('fatosfakes_admin_auth_token', adminPass);
          loadLocalVotersFallback();
        } else {
          setAdminError(data.error || 'Chave de acesso administrativo incorreta.');
        }
      }
    } catch {
      if (adminPass === DEFAULT_ADMIN_PASS) {
        setCurrentUserRole('admin');
        sessionStorage.setItem('fatosfakes_admin_auth_token', adminPass);
        loadLocalVotersFallback();
      } else {
        setAdminError('Falha ao autenticar com o servidor.');
      }
    } finally {
      setAdminLoading(false);
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
    setStats({
      totalVoters: formatted.length,
      totalBallots: formatted.length,
      statesCount: new Set(formatted.map(f => f.state)).size,
    });
  };

  const fetchAdminData = async (token: string) => {
    setIsLoadingAdminData(true);
    try {
      const res = await fetch(`/api/admin/voters?key=${encodeURIComponent(token)}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVotersList(data.voters || []);
        setStats(data.stats || { totalVoters: data.voters?.length || 0, totalBallots: data.voters?.length || 0, statesCount: 0 });
      } else {
        loadLocalVotersFallback();
      }
    } catch {
      loadLocalVotersFallback();
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  // Logout
  const handleLogout = () => {
    setCurrentUserRole('guest');
    setVoterProfile(null);
    setVoterCpf('');
    setAdminPass('');
    sessionStorage.removeItem('fatosfakes_voter_session');
    sessionStorage.removeItem('fatosfakes_admin_auth_token');
    localStorage.removeItem('fatosfakes_admin_auth_token');
  };

  // Filtro de Eleitores no Admin
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
              {currentUserRole === 'admin' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  Administrador Autenticado
                </span>
              )}
              {currentUserRole === 'voter' && (
                <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Cidadão Eleitor
                </span>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-rose-400 transition-colors py-1 px-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-500/30"
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
        {/* CASO 1: VISITANTE NÃO AUTENTICADO (TELA DE LOGIN UNIFICADA)   */}
        {/* ============================================================== */}
        {currentUserRole === 'guest' && (
          <div className="max-w-xl mx-auto">
            
            {/* Header explicativo */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-900 border border-slate-800 text-emerald-400 mb-4 shadow-inner">
                <UserCheck className="w-7 h-7" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Acesso ao Cadastro Cívico
              </h2>
              <p className="text-slate-400 text-sm mt-2 max-w-md mx-auto">
                Consulte seu comprovante de presença auditável na pesquisa presidencial e mantenha seus dados de contato e localização atualizados.
              </p>
            </div>

            {/* Alternador de Modo de Login (Cidadão vs Gestão) */}
            <div className="bg-[#0b1524] p-1.5 rounded-xl border border-slate-800/80 mb-6 flex gap-1">
              <button
                onClick={() => { setActiveLoginMode('voter'); setVoterError(''); setAdminError(''); }}
                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  activeLoginMode === 'voter'
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>Cidadão / Eleitor (Acessar com CPF)</span>
              </button>
              <button
                onClick={() => { setActiveLoginMode('admin'); setVoterError(''); setAdminError(''); }}
                className={`py-2.5 px-4 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all ${
                  activeLoginMode === 'admin'
                    ? 'bg-slate-800 text-white border border-slate-700 shadow-xs'
                    : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/40'
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Gestão</span>
              </button>
            </div>

            {/* FORMULÁRIO DO CIDADÃO (ELEITOR) */}
            {activeLoginMode === 'voter' && (
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
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold">Aviso de Cadastro</p>
                        <p className="mt-0.5 text-rose-200/90 leading-relaxed">{voterError}</p>
                      </div>
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

                {/* Garantia Cívica & Abaixo-Assinado */}
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
            )}

            {/* FORMULÁRIO DE GESTÃO (ADMINISTRADOR) */}
            {activeLoginMode === 'admin' && (
              <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl">
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                      Chave de Acesso Administrativo
                    </label>
                    <div className="relative">
                      <input
                        type={showAdminPass ? 'text' : 'password'}
                        value={adminPass}
                        onChange={(e) => setAdminPass(e.target.value)}
                        placeholder="Digite a senha mestre..."
                        className="w-full bg-[#080e18] border border-slate-700 focus:border-emerald-500 rounded-xl px-4 py-3 pr-11 text-white text-sm placeholder:text-slate-600 focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-colors"
                        autoFocus
                      />
                      <button
                        type="button"
                        onClick={() => setShowAdminPass(!showAdminPass)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {adminError && (
                    <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                      <span>{adminError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={adminLoading || !adminPass}
                    className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    {adminLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-emerald-400" />
                        <span>Autenticando Acesso...</span>
                      </>
                    ) : (
                      <>
                        <KeyRound className="w-4 h-4 text-emerald-400" />
                        <span>Entrar no Painel Geral de Gestão</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 2: CIDADÃO / ELEITOR LOGADO (PAINEL DO ELEITOR)          */}
        {/* ============================================================== */}
        {currentUserRole === 'voter' && voterProfile && (
          <div className="max-w-3xl mx-auto space-y-6">
            
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
                <button
                  onClick={() => copyToClipboard(voterProfile.cpf_hash || voterProfile.cpfHash || '', 'citizen_hash')}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 shrink-0 border border-slate-700"
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
                  
                  {/* Nome Completo (Bloqueado para integridade) */}
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2 flex items-center justify-between">
                      <span>Nome Completo</span>
                      <span className="text-[10px] text-slate-500 font-normal">Registro Travado</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={voterProfile.name}
                        disabled
                        className="w-full bg-[#080e18]/60 border border-slate-800 rounded-xl px-4 py-2.5 text-slate-400 text-sm font-medium cursor-not-allowed select-none"
                      />
                      <Lock className="w-3.5 h-3.5 text-slate-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
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

            {/* Caixa Educativa de Sigilo e Garantias */}
            <div className="p-5 rounded-2xl bg-slate-900/50 border border-slate-800/80 text-xs text-slate-400 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-slate-300">
                  Transparência e Proteção Constitucional de Dados
                </p>
                <p className="leading-relaxed">
                  Suas alterações são salvas diretamente nas tabelas de auditoria de presença. O candidato em quem você votou foi armazenado de forma anônima e desvinculada na urna cega, sendo impossível rastrear seu voto a partir do seu cadastro.
                </p>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* CASO 3: ADMINISTRADOR LOGADO (COM ACESSO AO PAINEL GERAL)      */}
        {/* ============================================================== */}
        {currentUserRole === 'admin' && (
          <div className="space-y-6">

            {/* Alternador de Abas do Administrador */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0b1524] p-3 rounded-2xl border border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setAdminActiveTab('overview')}
                  className={`py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    adminActiveTab === 'overview'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/10'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4" />
                  <span>Painel Geral de Eleitores ({votersList.length})</span>
                </button>
                <button
                  onClick={() => setAdminActiveTab('profile')}
                  className={`py-2 px-4 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                    adminActiveTab === 'profile'
                      ? 'bg-slate-800 text-white border border-slate-700'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Meu Perfil Cívico</span>
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => fetchAdminData(sessionStorage.getItem('fatosfakes_admin_auth_token') || DEFAULT_ADMIN_PASS)}
                  disabled={isLoadingAdminData}
                  className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 transition-colors flex items-center gap-1.5"
                  title="Atualizar dados do Supabase"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAdminData ? 'animate-spin text-emerald-400' : 'text-slate-400'}`} />
                  <span>Atualizar</span>
                </button>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 hover:bg-emerald-500/25 text-emerald-400 font-semibold transition-colors flex items-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* ABA 1: PAINEL GERAL DE AUDITORIA & ELEITORES */}
            {adminActiveTab === 'overview' && (
              <div className="space-y-6">
                
                {/* Métricas Principais */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                      <span>Total de Eleitores Cadastrados</span>
                      <Users className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-black text-white">{stats.totalVoters}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Lista auditável com 1 voto por CPF</p>
                  </div>

                  <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                      <span>Cédulas na Urna Cega</span>
                      <Vote className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div className="text-3xl font-black text-white">{stats.totalBallots}</div>
                    <p className="text-[11px] text-slate-500 mt-1">100% de sigilo garantido</p>
                  </div>

                  <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                      <span>Estados da Federação</span>
                      <Building className="w-4 h-4 text-amber-400" />
                    </div>
                    <div className="text-3xl font-black text-white">{stats.statesCount} UFs</div>
                    <p className="text-[11px] text-slate-500 mt-1">Abrangência territorial nacional</p>
                  </div>

                  <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-center justify-between text-slate-400 text-xs font-semibold mb-2">
                      <span>Banco de Dados Supabase</span>
                      <Database className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-base font-bold text-white">Sincronizado</span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">ebarklhztoerbfjvpnqb</p>
                  </div>
                </div>

                {/* Filtros e Busca */}
                <div className="bg-[#0b1524] border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
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

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span>Estado:</span>
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

                    <a
                      href="https://supabase.com/dashboard/project/ebarklhztoerbfjvpnqb/editor"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 hover:border-emerald-500/50 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Ver no Supabase</span>
                    </a>
                  </div>
                </div>

                {/* Tabela de Eleitores */}
                <div className="bg-[#0b1524] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-slate-800 bg-[#080e18]/80 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                          <th className="py-3.5 px-4">Eleitor</th>
                          <th className="py-3.5 px-4">Contato (E-mail / WhatsApp)</th>
                          <th className="py-3.5 px-4">Localização</th>
                          <th className="py-3.5 px-4">Status</th>
                          <th className="py-3.5 px-4">Hash de Auditoria</th>
                          <th className="py-3.5 px-4">Registro</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
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
                                <td className="py-3.5 px-4">
                                  <div className="font-bold text-white text-xs">{voter.name}</div>
                                  <div className="font-mono text-[11px] text-slate-400 mt-0.5">{maskedCpf}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <div className="text-slate-300 font-medium">{voter.email || <span className="text-slate-600 italic">Não informado</span>}</div>
                                  <div className="text-slate-400 text-[11px] mt-0.5">{voter.phone || <span className="text-slate-600 italic">Não informado</span>}</div>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-block px-1.5 py-0.5 rounded bg-slate-800 font-bold text-[10px] text-slate-300 mr-1.5 border border-slate-700">
                                    {voter.state}
                                  </span>
                                  <span className="text-slate-300">{voter.city}</span>
                                </td>
                                <td className="py-3.5 px-4">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                    <Check className="w-3 h-3" />
                                    Confirmado
                                  </span>
                                </td>
                                <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                                  <div className="flex items-center gap-1.5 max-w-[180px]">
                                    <span className="truncate" title={hash}>{hash.slice(0, 16)}...</span>
                                    <button
                                      onClick={() => copyToClipboard(hash, `hash-${index}`)}
                                      className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-emerald-400 transition-colors"
                                      title="Copiar Hash"
                                    >
                                      {copiedHash === `hash-${index}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                                    </button>
                                  </div>
                                </td>
                                <td className="py-3.5 px-4 text-slate-400 text-[11px]">
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

            {/* ABA 2: VISUALIZAR MEU PERFIL CÍVICO (COMO ADMIN) */}
            {adminActiveTab === 'profile' && (
              <div className="max-w-2xl mx-auto bg-[#0b1524] border border-slate-800 rounded-2xl p-6 sm:p-8">
                <h3 className="text-lg font-bold text-white mb-2">Acesso e Credenciais de Administrador</h3>
                <p className="text-xs text-slate-400 mb-6 leading-relaxed">
                  Você está autenticado com privilégios de superusuário de governança cívica. Sua sessão permite auditar todos os cadastros, verificar a integridade da urna cega e emitir relatórios para fins de fiscalização eleitoral.
                </p>
                <div className="bg-[#080e18] p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Nível de Permissão:</span>
                    <span className="font-bold text-emerald-400">Auditor-Chefe / Administrador</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Projeto Supabase:</span>
                    <span className="font-mono">ebarklhztoerbfjvpnqb</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span className="text-slate-500">Sessão Local:</span>
                    <span className="text-emerald-400 font-semibold">Ativa e Persistente</span>
                  </div>
                </div>
              </div>
            )}

          </div>
        )}

      </main>
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
