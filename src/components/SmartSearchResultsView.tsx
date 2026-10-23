'use client';

import React from 'react';
import { SmartSearchResult } from '@/lib/searchEngine';
import { FactCheckCard } from './FactCheckCard';
import { 
  Sparkles, 
  Search, 
  ShieldCheck, 
  Scale, 
  Users, 
  Vote, 
  ExternalLink, 
  ArrowRight,
  Clock,
  AlertOctagon,
  CheckCircle2,
  Globe,
  Info,
  Check,
  ChevronRight
} from 'lucide-react';

interface SmartSearchResultsViewProps {
  searchResult: SmartSearchResult;
  onNavigateTab: (tab: 'facts' | 'polls' | 'politicians' | 'processes' | 'security') => void;
  onSelectPolitician: (politicianId: string) => void;
  onSelectPoliticianProcesses: (politicianId: string) => void;
  onClearSearch: () => void;
  isSearchingLive?: boolean;
  liveCount?: number;
}

export function SmartSearchResultsView({
  searchResult,
  onNavigateTab,
  onSelectPolitician,
  onSelectPoliticianProcesses,
  onClearSearch,
  isSearchingLive,
  liveCount = 0,
}: SmartSearchResultsViewProps) {
  const { 
    parsedQuery, 
    exactTopicMatches, 
    relatedPoliticianMatches, 
    factChecks, 
    exactProcesses, 
    relatedProcesses, 
    processes, 
    politicians, 
    candidates, 
    totalCount 
  } = searchResult;

  const hasTopicKeywords = parsedQuery.topicKeywords.length > 0;
  const topicString = parsedQuery.topicKeywords.join(' ');

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Banner de Entendimento da Busca Inteligente */}
      <div className="bg-gradient-to-r from-[#0f2744] via-[#16355c] to-[#1e4677] text-white p-6 sm:p-8 rounded-3xl border border-[#2d527c] shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 text-xs font-black uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Busca Inteligente Ativa</span>
              </div>

              {isSearchingLive && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 text-xs font-bold animate-pulse">
                  <Globe className="w-3.5 h-3.5 animate-spin" />
                  <span>Consultando web aberta ao vivo...</span>
                </div>
              )}

              {!isSearchingLive && liveCount > 0 && (
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-500/20 text-sky-200 border border-sky-400/30 text-xs font-bold">
                  <Globe className="w-3.5 h-3.5 text-sky-300" />
                  <span>+{liveCount} checagens capturadas da web</span>
                </div>
              )}
            </div>

            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              {parsedQuery.semanticIntentSummary}
            </h2>

            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300 pt-1">
              {parsedQuery.detectedPoliticianName && (
                <span className="bg-white/10 px-3 py-1 rounded-xl border border-white/10 font-bold text-white flex items-center gap-1.5">
                  <span>👤 Político:</span>
                  <strong className="text-emerald-300">{parsedQuery.detectedPoliticianName}</strong>
                </span>
              )}
              {hasTopicKeywords && (
                <span className="bg-white/10 px-3 py-1 rounded-xl border border-white/10 font-bold text-white flex items-center gap-1.5">
                  <span>🎯 Tema Específico:</span>
                  <strong className="text-amber-300">{topicString}</strong>
                </span>
              )}
            </div>
          </div>

          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs border border-white/20 transition-colors whitespace-nowrap self-end sm:self-auto shadow-xs"
          >
            Limpar busca
          </button>
        </div>

        {/* Pilares com Contagem Rápida */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-700/60">
          <button 
            onClick={() => onNavigateTab('facts')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Checagens</span>
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-xl font-black text-white">{factChecks.length}</div>
          </button>

          <button 
            onClick={() => onNavigateTab('processes')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Processos Judiciais</span>
              <Scale className="w-3.5 h-3.5 text-sky-400" />
            </div>
            <div className="text-xl font-black text-white">{processes.length}</div>
          </button>

          <button 
            onClick={() => onNavigateTab('politicians')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Fichas de Políticos</span>
              <Users className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-xl font-black text-white">{politicians.length}</div>
          </button>

          <button 
            onClick={() => onNavigateTab('polls')}
            className="p-3.5 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-left transition-colors"
          >
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span>Pesquisa Eleitoral</span>
              <Vote className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="text-xl font-black text-white">{candidates.length}</div>
          </button>
        </div>
      </div>

      {totalCount === 0 && (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <Search className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum resultado localizado para essa combinação</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente buscar combinando o nome do político e o assunto principal, como &ldquo;Lula carne&rdquo;, &ldquo;Tarcisio Sabesp&rdquo;, &ldquo;Nikolas STF&rdquo; ou &ldquo;Zema salario&rdquo;.
          </p>
          <button
            onClick={onClearSearch}
            className="px-4 py-2 rounded-xl bg-[#0f2744] text-white text-xs font-bold"
          >
            Ver todas as checagens
          </button>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 1A: RESULTADOS COM CORRESPONDÊNCIA EXATA SOBRE O TEMA PESQUISADO
          Prioridade máxima solicitada pelo usuário (ex: Tarcísio Sabesp)
         ========================================================================= */}
      {exactTopicMatches.length > 0 && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b-2 border-emerald-500">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-black text-xs uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-200" />
                <span>🎯 Correspondência Exata no Tema</span>
              </span>
              <span className="text-xs text-slate-600 font-bold">
                ({exactTopicMatches.length} {exactTopicMatches.length === 1 ? 'checagem direta' : 'checagens diretas'})
              </span>
            </div>
            <span className="text-xs text-slate-500">
              Assunto verificado: <strong className="text-slate-800">{hasTopicKeywords ? topicString : parsedQuery.rawQuery}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {exactTopicMatches.map(({ item }) => (
              <FactCheckCard 
                key={item.id} 
                factCheck={item} 
                onFilterByPolitician={onSelectPolitician}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 1B: OUTRAS CHECAGENS DO POLÍTICO (SOBRE OUTROS TEMAS)
          Claramente separadas para evitar confusão entre o tema buscado e outros fatos
         ========================================================================= */}
      {hasTopicKeywords && relatedPoliticianMatches.length > 0 && (
        <div className="space-y-4 pt-6 border-t-2 border-dashed border-slate-300">
          <div className="bg-slate-100/90 p-4 rounded-2xl border border-slate-200/90">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700 text-white font-bold text-xs uppercase tracking-wider">
                  <Users className="w-3.5 h-3.5 text-slate-300" />
                  <span>👤 Outras Checagens Registradas deste Político</span>
                </span>
                <span className="text-xs text-slate-700 font-bold">
                  ({relatedPoliticianMatches.length} sobre outros assuntos)
                </span>
              </div>
              <span className="text-xs text-slate-500 italic">
                Não tratam de &ldquo;{topicString}&rdquo;, mas pertencem ao histórico de {parsedQuery.detectedPoliticianName}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 opacity-95">
            {relatedPoliticianMatches.map(({ item }) => (
              <FactCheckCard 
                key={item.id} 
                factCheck={item} 
                onFilterByPolitician={onSelectPolitician}
              />
            ))}
          </div>
        </div>
      )}

      {/* Fallback de FactChecks quando não há separação de tema */}
      {!hasTopicKeywords && exactTopicMatches.length === 0 && factChecks.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Notícias Checadas ({factChecks.length})</span>
            </h3>
            <span className="text-xs text-slate-500 font-semibold">Classificadas por relevância</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {factChecks.map(({ item }) => (
              <FactCheckCard 
                key={item.id} 
                factCheck={item} 
                onFilterByPolitician={onSelectPolitician}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 2: PROCESSOS JUDICIAIS ENCONTRADOS (COM SEPARAÇÃO TEMÁTICA)
         ========================================================================= */}
      {exactProcesses.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <Scale className="w-5 h-5 text-sky-800" />
                <span>Processos &amp; Inquéritos sobre o Tema ({exactProcesses.length})</span>
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('processes')}
              className="text-xs text-sky-800 font-bold hover:underline flex items-center gap-1"
            >
              <span>Abrir central de tribunais</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {exactProcesses.map(({ item: proc }) => (
              <article 
                key={proc.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-[#0f2744] text-white">
                    {proc.court}
                  </span>
                  <span className="text-xs font-bold text-slate-600 font-mono">
                    {proc.processNumber}
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm leading-snug">
                    {proc.subject}
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold mt-0.5">
                    {proc.politicianName} ({proc.politicianRole})
                  </p>
                </div>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {proc.summary}
                </p>

                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700">
                  <strong className="text-slate-900 block mb-1">Posicionamento da Defesa:</strong>
                  <p className="italic line-clamp-2">&ldquo;{proc.defensePosition}&rdquo;</p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-xs">
                  <a
                    href={proc.courtUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-800 hover:text-sky-950 font-bold flex items-center gap-1"
                  >
                    <span>Consultar no {proc.court}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>

                  <button
                    onClick={() => onSelectPoliticianProcesses(proc.politicianId)}
                    className="text-slate-600 hover:text-slate-900 font-semibold"
                  >
                    Ver ficha do político →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* Outros processos do político (se houver) */}
      {hasTopicKeywords && relatedProcesses.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="font-bold flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-slate-500" />
              <span>Outros processos de {parsedQuery.detectedPoliticianName} em tramitação ({relatedProcesses.length}):</span>
            </span>
            <button
              onClick={() => onNavigateTab('processes')}
              className="text-sky-800 hover:underline font-bold"
            >
              Ver todos no tribunal →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 opacity-90">
            {relatedProcesses.map(({ item: proc }) => (
              <article 
                key={proc.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs p-5 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-xs px-2.5 py-0.5 rounded-lg bg-slate-800 text-white">
                    {proc.court}
                  </span>
                  <span className="text-xs font-mono text-slate-500">
                    {proc.processNumber}
                  </span>
                </div>
                <h4 className="font-bold text-slate-900 text-sm leading-snug">
                  {proc.subject}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2">
                  {proc.summary}
                </p>
                <div className="pt-2 flex items-center justify-between text-xs border-t border-slate-100">
                  <a
                    href={proc.courtUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sky-800 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>Consultar processo</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          SEÇÃO 3: POLÍTICOS CORRESPONDENTES
         ========================================================================= */}
      {politicians.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              <span>Fichas dos Políticos Mapeados ({politicians.length})</span>
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {politicians.map(({ item: p }) => (
              <div 
                key={p.id}
                onClick={() => onSelectPolitician(p.id)}
                className="bg-white rounded-3xl border border-slate-200 p-4 shadow-sm hover:shadow-md cursor-pointer transition-all flex items-center gap-3.5 group"
              >
                <img 
                  src={p.photoUrl} 
                  alt={p.name} 
                  className="w-12 h-12 rounded-2xl object-cover border border-slate-200 group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                      {p.party}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700">
                      {p.stats.fatos} Fatos · {p.stats.fakes} Fakes
                    </span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-sm truncate mt-1">
                    {p.popularName}
                  </h4>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <p className="text-[11px] text-slate-500 truncate">{p.role}</p>
                    {p.alreadyElected && p.currentMandate && (
                      <span className="text-[9px] font-bold text-emerald-900 bg-emerald-100 px-1.5 py-0.2 rounded border border-emerald-300">
                        ✅ Já Eleito
                      </span>
                    )}
                    {p.eligibilityStatus === 'CONDENADO' && (
                      <span className="text-[9px] font-black text-rose-900 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                        ⛔ Condenado
                      </span>
                    )}
                    {p.eligibilityStatus === 'INELEGIVEL' && (
                      <span className="text-[9px] font-black text-rose-800 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-200">
                        ⚠️ Inelegível
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
