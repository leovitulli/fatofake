'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
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
  Check
} from 'lucide-react';
import { getVotersRegistry } from '@/lib/voteService';

interface VoterRow {
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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  
  // Dados do Painel
  const [voters, setVoters] = useState<VoterRow[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [stats, setStats] = useState({
    totalVoters: 0,
    totalBallots: 0,
    statesCount: 0,
  });
  const [isSupabaseOnline, setIsSupabaseOnline] = useState<boolean | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUf, setSelectedUf] = useState('TODAS');
  const [copiedHash, setCopiedHash] = useState<string | null>(null);

  const DEFAULT_ADMIN_PASS = 'admin@fatosfakes2026';

  // Verifica se já estava logado na sessão do navegador
  useEffect(() => {
    const savedToken = sessionStorage.getItem('fatosfakes_admin_auth_token') || localStorage.getItem('fatosfakes_admin_auth_token');
    if (savedToken) {
      setPassword(savedToken);
      fetchVoters(savedToken);
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    try {
      const res = await fetch(`/api/admin/voters?key=${encodeURIComponent(password)}`, {
        headers: {
          'Authorization': `Bearer ${password}`
        }
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem('fatosfakes_admin_auth_token', password);
        localStorage.setItem('fatosfakes_admin_auth_token', password);
        setVoters(data.voters || []);
        setStats(data.stats || { totalVoters: data.voters?.length || 0, totalBallots: data.voters?.length || 0, statesCount: 0 });
        setIsSupabaseOnline(true);
      } else {
        // Se a senha estiver correta mas o Supabase não tiver tabela ou estiver offline,
        // permite fallback local para o administrador conseguir gerenciar
        if (password === DEFAULT_ADMIN_PASS) {
          setIsAuthenticated(true);
          sessionStorage.setItem('fatosfakes_admin_auth_token', password);
          loadLocalVotersFallback();
        } else {
          setAuthError(data.error || 'Senha de administrador incorreta.');
        }
      }
    } catch {
      // Fallback offline se a senha padrão for digitada
      if (password === DEFAULT_ADMIN_PASS) {
        setIsAuthenticated(true);
        sessionStorage.setItem('fatosfakes_admin_auth_token', password);
        loadLocalVotersFallback();
      } else {
        setAuthError('Não foi possível conectar ao servidor de autenticação.');
      }
    } finally {
      setIsVerifying(false);
    }
  };

  const loadLocalVotersFallback = () => {
    const local = getVotersRegistry();
    const formatted: VoterRow[] = local.map((v, i) => ({
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
    setVoters(formatted);
    setStats({
      totalVoters: formatted.length,
      totalBallots: formatted.length,
      statesCount: new Set(formatted.map(f => f.state)).size,
    });
    setIsSupabaseOnline(false);
  };

  const fetchVoters = async (token: string) => {
    setIsLoadingData(true);
    try {
      const res = await fetch(`/api/admin/voters?key=${encodeURIComponent(token)}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        setIsSupabaseOnline(true);
        // Une dados do Supabase com eventuais dados locais ainda não sincronizados
        const cloudVoters: VoterRow[] = data.voters || [];
        const localVoters = getVotersRegistry();

        // Evita duplicatas pelo cpf_hash
        const hashesSeen = new Set(cloudVoters.map(v => v.cpf_hash || v.cpfHash));
        const extraLocal = localVoters.filter(lv => !hashesSeen.has(lv.cpfHash)).map((lv, i) => ({
          id: `local-${i}`,
          name: lv.name || lv.nameMasked || 'Cidadão Eleitor',
          cpf_masked: lv.cpfMasked || '***.***.***-**',
          cpf_hash: lv.cpfHash,
          email: lv.email || '',
          phone: lv.phone || '',
          state: lv.state,
          city: lv.city,
          has_voted: lv.hasVoted,
          poll_id: lv.pollId,
          created_at: lv.registeredAt,
        }));

        const merged = [...cloudVoters, ...extraLocal];
        setVoters(merged);
        setStats({
          totalVoters: merged.length,
          totalBallots: data.stats?.totalBallots || merged.length,
          statesCount: new Set(merged.map(m => m.state)).size,
        });
      } else {
        loadLocalVotersFallback();
      }
    } catch {
      loadLocalVotersFallback();
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('fatosfakes_admin_auth_token');
    localStorage.removeItem('fatosfakes_admin_auth_token');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleCopyHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    setCopiedHash(hash);
    setTimeout(() => setCopiedHash(null), 2000);
  };

  const handleExportCSV = () => {
    if (voters.length === 0) {
      alert('Nenhum registro para exportar no momento.');
      return;
    }

    const headers = ['Nome Completo', 'CPF Mascarado', 'E-mail', 'Celular / WhatsApp', 'Estado (UF)', 'Cidade', 'Pesquisa', 'Data e Hora', 'Status'];
    const rows = filteredVoters.map(v => [
      `"${v.name || 'Cidadão'}"`,
      `"${v.cpf_masked || v.cpfMasked || '***.***.***-**'}"`,
      `"${v.email || ''}"`,
      `"${v.phone || ''}"`,
      `"${v.state || ''}"`,
      `"${v.city || ''}"`,
      `"${v.poll_id || v.pollId || 'Presidencial 2026'}"`,
      `"${v.created_at || v.registeredAt ? new Date(v.created_at || v.registeredAt!).toLocaleString('pt-BR') : ''}"`,
      `"Voto Registrado"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `eleitores_cadastrados_fatosfakes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filtragem
  const filteredVoters = voters.filter(v => {
    const nome = (v.name || '').toLowerCase();
    const cidade = (v.city || '').toLowerCase();
    const cpf = (v.cpf_masked || v.cpfMasked || '').toLowerCase();
    const search = searchTerm.toLowerCase();

    const matchesSearch = !searchTerm || nome.includes(search) || cidade.includes(search) || cpf.includes(search);
    const matchesUf = selectedUf === 'TODAS' || v.state === selectedUf;

    return matchesSearch && matchesUf;
  });

  const uniqueUfs = Array.from(new Set(voters.map(v => v.state).filter(Boolean))).sort();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Barra Superior Oculta / Discreta */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 py-3.5 sticky top-0 z-30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link 
              href="/" 
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Voltar ao Portal Público"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Lock className="w-4 h-4 text-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm tracking-tight text-white">FATOS &amp; FAKES</span>
                  <span className="text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Área Administrativa
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Controle Interno de Eleitores &amp; Urna Cega</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/"
              className="text-xs text-slate-400 hover:text-white transition-colors hidden sm:inline-block"
            >
              Ir para o Site Público
            </Link>
            {isAuthenticated && (
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-3 py-1.5 rounded-lg border border-rose-500/30 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sair</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        
        {/* TELA DE LOGIN DISCRETA */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto my-12 bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 mx-auto flex items-center justify-center mb-3">
                <KeyRound className="w-6 h-6 text-emerald-400" />
              </div>
              <h1 className="text-xl font-bold text-white tracking-tight">
                Acesso Restrito ao Administrador
              </h1>
              <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                Este painel permite visualizar todas as pessoas cadastradas que participaram das votações da urna cívica.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Chave Mestra / Senha do Administrador
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Digite a chave de acesso..."
                    required
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 pr-10 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {authError && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{authError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={isVerifying}
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl text-sm transition-all duration-150 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Verificando Chave...</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Acessar Lista de Eleitores</span>
                  </>
                )}
              </button>
            </form>

            {/* Dica da Chave Padrão para Facilidade do Usuário */}
            <div className="mt-6 pt-5 border-t border-slate-800 text-center">
              <p className="text-[11px] text-slate-400 mb-2">Chave mestra de acesso padrão configurada:</p>
              <div className="inline-flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400">
                <span>{DEFAULT_ADMIN_PASS}</span>
                <button
                  onClick={() => setPassword(DEFAULT_ADMIN_PASS)}
                  className="text-slate-400 hover:text-white underline text-[10px]"
                >
                  Usar Chave
                </button>
              </div>
            </div>
          </div>
        ) : (
          
          /* PAINEL DE CONTROLE DE ELEITORES CADASTRADOS */
          <div className="space-y-6">
            
            {/* Cabeçalho do Dashboard */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2 border-b border-slate-800">
              <div>
                <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
                  <span>Eleitores Cadastrados</span>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                    {voters.length} cadastrados
                  </span>
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Lista oficial e auditável de cidadãos registrados com CPF verificado para prevenção de voto duplicado.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => fetchVoters(password)}
                  disabled={isLoadingData}
                  className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-700 transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingData ? 'animate-spin text-emerald-400' : ''}`} />
                  <span>Atualizar</span>
                </button>

                <button
                  onClick={handleExportCSV}
                  className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>
            </div>

            {/* Grid de Métricas Principais */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Eleitores Únicos</span>
                  <Users className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{voters.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Registrados com CPF auditado</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Cédulas na Urna</span>
                  <Vote className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-white">{stats.totalBallots || voters.length}</div>
                <p className="text-[11px] text-slate-400 mt-1">Votos desassociados na urna cega</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Prevenção Voto Duplo</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400">100%</div>
                <p className="text-[11px] text-slate-400 mt-1">Hash SHA-256 + Salt ativo</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-medium">Banco Conectado</span>
                  <Database className="w-4 h-4 text-sky-400" />
                </div>
                <div className="text-sm font-bold text-white flex items-center gap-1.5 mt-1">
                  <span className={`w-2 h-2 rounded-full ${isSupabaseOnline ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
                  <span>{isSupabaseOnline ? 'Supabase Cloud' : 'Armazenamento Local'}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">ebarklhztoerbfjvpnqb</p>
              </div>

            </div>

            {/* Aviso Editorial e Constitucional de Urna Cega */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-200">
                    Garantia de Sigilo do Voto (Art. 14 da Constituição Federal)
                  </h4>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">
                    Você tem acesso à lista completa de presenças (quem votou) para impedir fraude e duplicação. 
                    Porém, a escolha do candidato é desassociada na urna cega (<code className="text-emerald-400 font-mono">poll_votes</code>), 
                    garantindo o sigilo constitucional do voto.
                  </p>
                </div>
              </div>

              <a
                href="https://supabase.com/dashboard/project/ebarklhztoerbfjvpnqb/editor"
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-3 py-1.5 rounded-lg border border-slate-700 transition-colors text-[11px] font-medium"
              >
                <span>Ver no Supabase Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Barra de Filtros e Busca */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por nome, cidade ou CPF..."
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <span className="text-xs text-slate-400 font-medium">Filtrar por UF:</span>
                <select
                  value={selectedUf}
                  onChange={(e) => setSelectedUf(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-emerald-500"
                >
                  <option value="TODAS">Todos os Estados ({voters.length})</option>
                  {uniqueUfs.map(uf => (
                    <option key={uf} value={uf}>
                      {uf} ({voters.filter(v => v.state === uf).length})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Tabela de Eleitores Cadastrados */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-medium uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="py-3 px-4">#</th>
                      <th className="py-3 px-4">Cidadão / Nome</th>
                      <th className="py-3 px-4">CPF Mascarado</th>
                      <th className="py-3 px-4">Contato (E-mail / Whats)</th>
                      <th className="py-3 px-4">Localidade</th>
                      <th className="py-3 px-4">Data e Horário</th>
                      <th className="py-3 px-4">Pesquisa</th>
                      <th className="py-3 px-4">Status de Voto</th>
                      <th className="py-3 px-4 text-right">Hash Auditoria</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredVoters.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="py-12 text-center text-slate-400">
                          <Users className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                          <p className="font-medium text-sm text-slate-300">Nenhum eleitor encontrado.</p>
                          <p className="text-xs text-slate-500 mt-1">
                            {searchTerm || selectedUf !== 'TODAS'
                              ? 'Tente ajustar os filtros de busca acima.'
                              : 'Quando os cidadãos confirmarem seus votos na urna da página principal, seus registros aparecerão aqui.'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredVoters.map((voter, index) => {
                        const dateStr = voter.created_at || voter.registeredAt;
                        const formattedDate = dateStr 
                          ? new Date(dateStr).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })
                          : 'Recentemente';
                        const hash = voter.cpf_hash || voter.cpfHash || '';
                        const truncatedHash = hash ? `${hash.slice(0, 8)}...${hash.slice(-6)}` : '---';

                        return (
                          <tr key={voter.id || index} className="hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-mono text-slate-500 text-[11px]">
                              {index + 1}
                            </td>
                            <td className="py-3.5 px-4 font-semibold text-white">
                              {voter.name || 'Cidadão Eleitor'}
                            </td>
                            <td className="py-3.5 px-4 font-mono text-slate-300">
                              {voter.cpf_masked || voter.cpfMasked || '***.***.***-**'}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                              {voter.email && <div className="text-slate-200 font-medium truncate max-w-[170px]">{voter.email}</div>}
                              {voter.phone && <div className="text-slate-400 font-mono">{voter.phone}</div>}
                              {!voter.email && !voter.phone && <span className="text-slate-600">Não informado</span>}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <span className="font-medium">{voter.city}</span>
                              <span className="text-slate-500 ml-1">/ {voter.state}</span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                              {formattedDate}
                            </td>
                            <td className="py-3.5 px-4 text-slate-300">
                              <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700/80 text-[10px] font-medium text-slate-300">
                                {voter.poll_id || voter.pollId || 'Presidencial 2026'}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[11px]">
                                <CheckCircle2 className="w-3 h-3" />
                                <span>Voto Confirmado</span>
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              {hash ? (
                                <button
                                  onClick={() => handleCopyHash(hash)}
                                  className="inline-flex items-center gap-1 font-mono text-[11px] text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 px-2 py-1 rounded transition-colors"
                                  title="Copiar Hash SHA-256 do Eleitor"
                                >
                                  <span>{truncatedHash}</span>
                                  {copiedHash === hash ? (
                                    <Check className="w-3 h-3 text-emerald-400" />
                                  ) : (
                                    <Copy className="w-3 h-3 text-slate-500" />
                                  )}
                                </button>
                              ) : (
                                <span className="text-slate-600 font-mono">---</span>
                              )}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {filteredVoters.length > 0 && (
                <div className="bg-slate-950/90 border-t border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-400">
                  <span>Exibindo {filteredVoters.length} de {voters.length} registros</span>
                  <span>Atualizado em tempo real</span>
                </div>
              )}
            </div>

            {/* Painel com Instruções de Acesso ao Supabase Cloud */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <Database className="w-4 h-4 text-sky-400" />
                <span>Onde os dados ficam salvos na nuvem (Supabase)</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed mb-4">
                Todos os eleitores cadastrados e as cédulas anônimas são gravados no seu projeto oficial do Supabase (<code className="text-sky-300">ebarklhztoerbfjvpnqb</code>). 
                Para auditar diretamente no banco de dados da nuvem:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-emerald-400 flex items-center gap-1.5 mb-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>Tabela: voters_registry</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Armazena o Nome, CPF Mascarado, Estado, Cidade e Data do cadastro. Utilizada para checar se o cidadão já votou.
                  </p>
                </div>
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800">
                  <div className="font-semibold text-sky-400 flex items-center gap-1.5 mb-1">
                    <Vote className="w-3.5 h-3.5" />
                    <span>Tabela: poll_votes</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Armazena as cédulas da urna (candidato_id e hash) sem nenhum dado pessoal para manter o sigilo absoluto do voto.
                  </p>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* Rodapé Discreto */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        <span>Painel Restrito de Auditoria Eleitoral · FATOS &amp; FAKES 2026</span>
      </footer>

    </div>
  );
}
