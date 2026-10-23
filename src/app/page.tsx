'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Header } from '@/components/Header';
import { FactCheckCard } from '@/components/FactCheckCard';
import { PollView } from '@/components/PollView';
import { PoliticiansGrid } from '@/components/PoliticiansGrid';
import { SecurityAuditExplainer } from '@/components/SecurityAuditExplainer';
import { JudicialProcessesView } from '@/components/JudicialProcessesView';
import { SmartSearchResultsView } from '@/components/SmartSearchResultsView';
import { executeSmartSearch, SmartSearchResult } from '@/lib/searchEngine';
import { INITIAL_FACT_CHECKS } from '@/data/factChecks';
import { INITIAL_POLITICIANS } from '@/data/politicians';
import { INITIAL_POLLS } from '@/data/polls';
import { INITIAL_JUDICIAL_PROCESSES } from '@/data/judicialProcesses';
import { searchOpenWebLive } from '@/lib/clientLiveSearch';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Sparkles, 
  X, 
  ShieldCheck, 
  Vote,
  ExternalLink,
  Info,
  Scale,
  Globe,
  Lock
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'facts' | 'polls' | 'politicians' | 'processes' | 'security'>('facts');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerdict, setSelectedVerdict] = useState<string>('TODOS');
  const [selectedRole, setSelectedRole] = useState<string>('TODOS');
  const [selectedPoliticianId, setSelectedPoliticianId] = useState<string | null>(null);

  // Atalho discreto do Administrador (Ctrl + Shift + A ou Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        router.push('/admin');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [router]);

  // Filtros combinados de Fatos & Fakes
  const filteredFactChecks = useMemo(() => {
    return INITIAL_FACT_CHECKS.filter(item => {
      // Filtro por Político específico selecionado
      if (selectedPoliticianId && item.politician.id !== selectedPoliticianId) {
        return false;
      }

      // Filtro por Veredito
      if (selectedVerdict !== 'TODOS' && item.verdict !== selectedVerdict) {
        return false;
      }

      // Filtro por Cargo
      if (selectedRole !== 'TODOS' && item.politician.role !== selectedRole) {
        return false;
      }

      // Filtro de Texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = item.title.toLowerCase().includes(query);
        const matchesSummary = item.summary.toLowerCase().includes(query);
        const matchesPolitician = item.politician.name.toLowerCase().includes(query);
        const matchesTags = item.tags.some(tag => tag.toLowerCase().includes(query));
        const matchesAgency = item.sourceAgency.toLowerCase().includes(query);

        return matchesTitle || matchesSummary || matchesPolitician || matchesTags || matchesAgency;
      }

      return true;
    });
  }, [searchQuery, selectedVerdict, selectedRole, selectedPoliticianId]);

  const selectedPoliticianData = useMemo(() => {
    if (!selectedPoliticianId) return null;
    return INITIAL_POLITICIANS.find(p => p.id === selectedPoliticianId) || null;
  }, [selectedPoliticianId]);

  // Handler para navegar e filtrar direto por político
  const handleInspectPolitician = (politicianId: string) => {
    setSelectedPoliticianId(politicianId);
    setActiveTab('facts');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  // Handler para inspecionar processos de um político específico
  const handleInspectProcesses = (politicianId: string) => {
    setSelectedPoliticianId(politicianId);
    setActiveTab('processes');
    window.scrollTo({ top: 380, behavior: 'smooth' });
  };

  const [isSearchingLive, setIsSearchingLive] = useState(false);
  const [liveResults, setLiveResults] = useState<SmartSearchResult | null>(null);
  const [liveCount, setLiveCount] = useState<number>(0);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedVerdict('TODOS');
    setSelectedRole('TODOS');
    setSelectedPoliticianId(null);
    setLiveResults(null);
    setLiveCount(0);
    setIsSearchingLive(false);
  };

  const totalVotesCount = useMemo(() => {
    return INITIAL_POLLS.reduce((acc, curr) => acc + curr.totalVotes, 0);
  }, []);

  // Motor de Busca Local Instantâneo (0ms de latência)
  const localSearchResult = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return executeSmartSearch(
      searchQuery,
      INITIAL_FACT_CHECKS,
      INITIAL_JUDICIAL_PROCESSES,
      INITIAL_POLITICIANS,
      INITIAL_POLLS
    );
  }, [searchQuery]);

  // Efeito com debounce para busca ao vivo na web aberta e APIs gratuitas
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 2) {
      setLiveResults(null);
      setLiveCount(0);
      setIsSearchingLive(false);
      return;
    }

    const currentQuery = searchQuery.trim();
    setIsSearchingLive(true);

    const timer = setTimeout(async () => {
      try {
        const liveItems = await searchOpenWebLive(currentQuery);
        if (searchQuery.trim() === currentQuery) {
          const local = executeSmartSearch(
            currentQuery,
            INITIAL_FACT_CHECKS,
            INITIAL_JUDICIAL_PROCESSES,
            INITIAL_POLITICIANS,
            INITIAL_POLLS
          );

          // Deduplicação de títulos já presentes na base local
          const existingTitles = new Set(local.factChecks.map(f => f.item.title.toLowerCase()));
          const newLiveItems = liveItems.filter(item => !existingTitles.has(item.title.toLowerCase()));

          const formattedLive = newLiveItems.map(item => ({ item, score: 35 }));
          const mergedFactChecks = [...local.factChecks, ...formattedLive];

          // Separa itens ao vivo em exatos vs correlatos
          const liveExact: Array<{ item: typeof newLiveItems[0]; score: number }> = [];
          const liveRelated: Array<{ item: typeof newLiveItems[0]; score: number }> = [];

          if (local.parsedQuery.topicKeywords.length > 0) {
            for (const fl of formattedLive) {
              const normT = (fl.item.title || '').toLowerCase();
              const normS = (fl.item.summary || '').toLowerCase();
              const matchesKw = local.parsedQuery.topicKeywords.some(kw => normT.includes(kw) || normS.includes(kw));
              if (matchesKw) {
                liveExact.push(fl);
              } else {
                liveRelated.push(fl);
              }
            }
          } else {
            liveExact.push(...formattedLive);
          }

          setLiveResults({
            ...local,
            exactTopicMatches: [...local.exactTopicMatches, ...liveExact],
            relatedPoliticianMatches: [...local.relatedPoliticianMatches, ...liveRelated],
            factChecks: mergedFactChecks,
            totalCount: mergedFactChecks.length + local.processes.length + local.politicians.length + local.candidates.length,
          });
          setLiveCount(newLiveItems.length);
        }
      } catch (err) {
        console.warn('Erro ao consultar busca ao vivo:', err);
      } finally {
        setIsSearchingLive(false);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Resultado ativo: mescla ao vivo se disponível, ou resultado local instantâneo
  const activeSearchResult = (liveResults && liveResults.parsedQuery.rawQuery.toLowerCase() === searchQuery.trim().toLowerCase())
    ? liveResults
    : localSearchResult;

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-white">
      
      {/* Header Fixo */}
      <Header 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        totalChecks={INITIAL_FACT_CHECKS.length}
        totalVotes={totalVotesCount}
        totalProcesses={INITIAL_JUDICIAL_PROCESSES.length}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* ABA 1: FATOS & FAKES */}
        {activeTab === 'facts' && (
          <div className="space-y-8 animate-fadeIn">
            
            {/* Hero / Console Editorial de Investigação Cívica */}
            <div className="bg-slate-950 rounded-2xl p-6 sm:p-10 text-white shadow-2xl border border-slate-800/80 relative overflow-hidden">
              {/* Textura sutil de fundo estilo imprensa */}
              <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40 pointer-events-none"></div>
              
              <div className="relative z-10 max-w-3xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="tracking-wide uppercase text-[11px] font-bold">Auditoria Cívica em Tempo Real</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-[1.12]">
                  A verdade documental da política brasileira.
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                  Consulte declarações, inquéritos judiciais e boatos eleitorais. Cruzamos apurações do consórcio jornalístico IFCN com certidões do TSE e autos do STF.
                </p>

                {/* Omni Search Console */}
                <div className="relative mt-5 pt-1 max-w-3xl">
                  <div className="relative flex items-center bg-slate-900/90 border border-slate-700/80 rounded-2xl p-1.5 shadow-2xl focus-within:border-emerald-500/80 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
                    <div className="pl-3.5 pr-2 flex items-center pointer-events-none text-slate-400">
                      <Search className="w-5 h-5 text-emerald-400" />
                    </div>
                    <input 
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Pesquise combinando político e assunto (ex: Tarcísio Sabesp, Lula imposto, Bolsonaro TSE)..."
                      className="w-full bg-transparent text-white placeholder:text-slate-400 text-sm sm:text-base font-medium px-2 py-2.5 focus:outline-none"
                    />
                    {isSearchingLive && (
                      <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold bg-sky-950/60 px-2.5 py-1 rounded-lg border border-sky-800/60 animate-pulse mr-2">
                        <Globe className="w-3.5 h-3.5 animate-spin" />
                        <span className="hidden sm:inline">Varrendo bases abertas...</span>
                      </div>
                    )}
                    {searchQuery && (
                      <button 
                        onClick={() => clearAllFilters()}
                        className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors mr-1"
                        title="Limpar busca"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => {}}
                      className="hidden sm:flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs tracking-wide transition-all shadow-sm"
                    >
                      <span>Verificar</span>
                    </button>
                  </div>

                  {/* Tópicos em Pauta / Curadoria de Redação */}
                  <div className="flex flex-wrap items-center gap-2 mt-4 text-xs">
                    <span className="text-slate-400 font-semibold text-[11px] uppercase tracking-wider mr-1">
                      Em Apuração Hoje:
                    </span>
                    {[
                      { label: 'Sabesp & Tarifas (Tarcísio)', term: 'Tarcísio Sabesp' },
                      { label: 'Pesquisa 2º Turno (Lula × Flávio)', term: 'Lula Flavio pesquisa' },
                      { label: 'Inelegibilidade TSE (Bolsonaro)', term: 'Bolsonaro inelegível' },
                      { label: 'Banco Master (Dark Horse)', term: 'Banco Master' },
                      { label: 'Rachadinha & Coaf (Alerj)', term: 'Flávio Bolsonaro rachadinha' },
                      { label: 'Câmeras Corporais da PM', term: 'Tarcísio câmeras PM' },
                      { label: 'Mensalão & AP 470 (STF)', term: 'Lula mensalão' },
                    ].map(item => (
                      <button
                        key={item.term}
                        onClick={() => setSearchQuery(item.term)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-medium transition-all border border-slate-800 hover:border-slate-700 shadow-sm"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Se busca inteligente estiver ativa, exibe o painel unificado */}
            {activeSearchResult ? (
              <SmartSearchResultsView 
                searchResult={activeSearchResult}
                isSearchingLive={isSearchingLive}
                liveCount={liveCount}
                onNavigateTab={(tab) => {
                  setActiveTab(tab);
                  window.scrollTo({ top: 380, behavior: 'smooth' });
                }}
                onSelectPolitician={handleInspectPolitician}
                onSelectPoliticianProcesses={handleInspectProcesses}
                onClearSearch={clearAllFilters}
              />
            ) : (
              <>
                {/* Barra de Filtros e Categorias Ordinária */}
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                  
                  <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                    
                    {/* Filtro de Veredito */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
                      <span className="text-xs font-bold text-slate-400 mr-1 hidden sm:inline">Veredito:</span>
                      
                      <button
                        onClick={() => setSelectedVerdict('TODOS')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                          selectedVerdict === 'TODOS'
                            ? 'bg-slate-900 text-white'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        Todos
                      </button>

                      <button
                        onClick={() => setSelectedVerdict('FATO')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          selectedVerdict === 'FATO'
                            ? 'bg-emerald-600 text-white'
                            : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Apenas Fatos</span>
                      </button>

                      <button
                        onClick={() => setSelectedVerdict('FAKE')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          selectedVerdict === 'FAKE'
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200'
                        }`}
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Apenas Fakes</span>
                      </button>

                      <button
                        onClick={() => setSelectedVerdict('ENGANOSO')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap flex items-center gap-1.5 transition-all ${
                          selectedVerdict === 'ENGANOSO'
                            ? 'bg-amber-600 text-white'
                            : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Enganosos</span>
                      </button>
                    </div>

                    {/* Filtro de Cargos */}
                    <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                      <span className="text-xs font-bold text-slate-400">Cargo:</span>
                      <select
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                        className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      >
                        <option value="TODOS">Todos os Cargos</option>
                        <option value="Presidente">Presidente</option>
                        <option value="Governador">Governadores</option>
                        <option value="Senador">Senadores</option>
                        <option value="Deputado Federal">Deputados Federais</option>
                      </select>
                    </div>

                  </div>

                  {/* Tag de Filtro de Político Ativo */}
                  {selectedPoliticianData && (
                    <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs text-sky-900 animate-fadeIn">
                      <div className="flex items-center gap-2">
                        <img 
                          src={selectedPoliticianData.photoUrl} 
                          alt={selectedPoliticianData.name} 
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span>
                          Mostrando checagens de <strong>{selectedPoliticianData.popularName}</strong> ({selectedPoliticianData.party} - {selectedPoliticianData.role})
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedPoliticianId(null)}
                        className="p-1 rounded-md text-sky-700 hover:text-sky-950 hover:bg-sky-100 font-bold flex items-center gap-1"
                      >
                        <span>Limpar</span>
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                </div>

                {/* Cabeçalho da Lista de Resultados */}
                <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
                  <span>
                    {filteredFactChecks.length} {filteredFactChecks.length === 1 ? 'notícia checada' : 'notícias checadas'} cadastradas
                  </span>

                  {(selectedVerdict !== 'TODOS' || selectedRole !== 'TODOS' || selectedPoliticianId) && (
                    <button
                      onClick={clearAllFilters}
                      className="text-emerald-700 hover:underline font-bold"
                    >
                      Limpar filtros
                    </button>
                  )}
                </div>

                {/* Grid dos Cards de Checagem */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredFactChecks.map(check => (
                    <FactCheckCard 
                      key={check.id} 
                      factCheck={check} 
                      onFilterByPolitician={handleInspectPolitician}
                    />
                  ))}
                </div>
              </>
            )}

          </div>
        )}

        {/* ABA 2: PESQUISA ELEITORAL AUDITÁVEL */}
        {activeTab === 'polls' && (
          <div className="animate-fadeIn">
            <PollView 
              polls={INITIAL_POLLS} 
              onInspectPoliticianFactChecks={handleInspectPolitician}
              onInspectPoliticianProcesses={handleInspectProcesses}
            />
          </div>
        )}

        {/* ABA 3: POLÍTICOS */}
        {activeTab === 'politicians' && (
          <div className="animate-fadeIn">
            <PoliticiansGrid 
              politicians={INITIAL_POLITICIANS} 
              onSelectPolitician={handleInspectPolitician}
              onInspectProcesses={handleInspectProcesses}
            />
          </div>
        )}

        {/* ABA 4: TRIBUNAIS & PROCESSOS */}
        {activeTab === 'processes' && (
          <div className="animate-fadeIn">
            <JudicialProcessesView 
              processes={INITIAL_JUDICIAL_PROCESSES}
              selectedPoliticianId={selectedPoliticianId}
              onClearPoliticianFilter={() => setSelectedPoliticianId(null)}
              onInspectPoliticianFactChecks={handleInspectPolitician}
            />
          </div>
        )}

        {/* ABA 5: AUDITORIA, SIGILO E METODOLOGIA */}
        {activeTab === 'security' && (
          <div className="animate-fadeIn">
            <SecurityAuditExplainer />
          </div>
        )}

      </main>

      {/* Rodapé Cívico Institucional */}
      <footer className="bg-[#0f2744] text-slate-300 border-t border-[#1e3a5f] mt-16 py-10 px-4 sm:px-6 lg:px-8 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <span className="font-extrabold text-white text-base">FATOS &amp; FAKES</span>
            </div>
            <p className="text-slate-400">
              Plataforma cívica sem fins lucrativos dedicada à verdade na política e ao voto consciente.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 font-medium">
            <button onClick={() => setActiveTab('processes')} className="hover:text-white">
              Tribunais &amp; Processos
            </button>
            <button onClick={() => setActiveTab('security')} className="hover:text-white">
              Garantia de Sigilo do Voto
            </button>
            <button onClick={() => setActiveTab('security')} className="hover:text-white">
              Metodologia de Checagem
            </button>
            <a 
              href="https://www.tse.jus.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-white flex items-center gap-1"
            >
              <span>Portal TSE</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div>
            © 2026 FATOS &amp; FAKES · Desenvolvido com tecnologia de Urna Cega e Padrão Internacional ClaimReview (Schema.org).
          </div>
          <div className="flex items-center gap-2">
            <Link 
              href="/admin" 
              className="text-slate-700 hover:text-slate-400 p-1 rounded transition-colors"
              title="Acesso de Governança Interna (Ctrl+Shift+A)"
              aria-label="Acesso de Governança"
            >
              <Lock className="w-3.5 h-3.5 opacity-30 hover:opacity-100" />
            </Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
