'use client';

import React, { useState, useMemo } from 'react';
import { JudicialProcess, ProcessStatus } from '@/types';
import { 
  Scale, 
  Search, 
  Filter, 
  ExternalLink, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  Building, 
  Info,
  Calendar,
  X,
  ShieldCheck
} from 'lucide-react';

interface JudicialProcessesViewProps {
  processes: JudicialProcess[];
  selectedPoliticianId?: string | null;
  onClearPoliticianFilter?: () => void;
  onInspectPoliticianFactChecks: (politicianId: string) => void;
}

export function JudicialProcessesView({ 
  processes, 
  selectedPoliticianId,
  onClearPoliticianFilter,
  onInspectPoliticianFactChecks 
}: JudicialProcessesViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [courtFilter, setCourtFilter] = useState<string>('TODOS');
  const [statusFilter, setStatusFilter] = useState<string>('TODOS');

  const COURTS = ['TODOS', 'STF', 'STJ', 'TSE', 'TRF-1', 'TJSP', 'TJMG'];
  
  const STATUS_OPTIONS: Array<{ label: string; value: string }> = [
    { label: 'Todos os Status', value: 'TODOS' },
    { label: 'Em Investigação', value: 'EM_INVESTIGACAO' },
    { label: 'Condenado / Multa', value: 'CONDENADO' },
    { label: 'Arquivado / Absolvido', value: 'ARQUIVADO_ABSOLVIDO' },
  ];

  const getStatusBadge = (status: ProcessStatus) => {
    switch (status) {
      case 'EM_INVESTIGACAO':
        return {
          bg: 'bg-amber-50 text-amber-900 border-amber-300',
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          label: 'Inquérito / Em Investigação',
        };
      case 'CONDENADO':
        return {
          bg: 'bg-rose-50 text-rose-950 border-rose-300',
          icon: <AlertOctagon className="w-3.5 h-3.5 text-rose-600" />,
          label: 'Condenação / Multa',
        };
      case 'ARQUIVADO_ABSOLVIDO':
      default:
        return {
          bg: 'bg-emerald-50 text-emerald-950 border-emerald-300',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          label: 'Arquivado / Absolvido',
        };
    }
  };

  const filteredProcesses = useMemo(() => {
    return processes.filter(p => {
      if (selectedPoliticianId && p.politicianId !== selectedPoliticianId) return false;
      if (courtFilter !== 'TODOS' && p.court !== courtFilter) return false;
      if (statusFilter !== 'TODOS' && p.status !== statusFilter) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = p.politicianName.toLowerCase().includes(query);
        const matchesNumber = p.processNumber.toLowerCase().includes(query);
        const matchesSubject = p.subject.toLowerCase().includes(query);
        const matchesCourt = p.court.toLowerCase().includes(query);
        const matchesSummary = p.summary.toLowerCase().includes(query);

        return matchesName || matchesNumber || matchesSubject || matchesCourt || matchesSummary;
      }

      return true;
    });
  }, [processes, searchQuery, courtFilter, statusFilter, selectedPoliticianId]);

  return (
    <div className="space-y-6">
      
      {/* Banner da Seção Judicial */}
      <div className="bg-gradient-to-r from-[#0f2744] to-[#16355c] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#2d527c]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-400/20 text-sky-200 border border-sky-400/30 text-xs font-bold uppercase tracking-wider">
              <Scale className="w-3.5 h-3.5" />
              <span>Transparência Jurídica Cívica</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tribunais &amp; Processos Judiciais de Políticos
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Consulte inquéritos, ações e a situação de Ficha Limpa perante o <strong>STF, STJ, TSE e Tribunais de Justiça</strong>. Informações documentais com o posicionamento oficial da defesa e links de consulta pública.
            </p>
          </div>

          <div className="bg-[#09182b]/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <div className="flex items-center gap-1.5 text-sky-400 font-bold text-xs uppercase tracking-wider mb-1">
              <Scale className="w-4 h-4" />
              <span>Processos Mapeados</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {processes.length}
            </div>
            <span className="text-[11px] text-slate-400">casos públicos em acompanhamento</span>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-medium">
              ⚖️ Fontes dos Portais Oficiais dos Tribunais
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros e Busca de Processos */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        
        {/* Campo de Busca */}
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquise por nome do político, número do processo (ex: Inq 3989) ou tribunal..."
            className="w-full pl-12 pr-10 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600 focus:bg-white transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Linha de Filtros por Tribunal e por Status */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          
          {/* Seletor de Tribunal */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-bold text-slate-400 mr-1 hidden md:inline">Tribunal:</span>
            {COURTS.map(c => (
              <button
                key={c}
                onClick={() => setCourtFilter(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  courtFilter === c
                    ? 'bg-[#0f2744] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {c === 'TODOS' ? 'Todos os Tribunais' : c}
              </button>
            ))}
          </div>

          {/* Seletor de Situação */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-xs font-bold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-sky-600"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

        </div>

        {selectedPoliticianId && onClearPoliticianFilter && (
          <div className="flex items-center justify-between bg-sky-50 border border-sky-200 p-2.5 rounded-xl text-xs text-sky-900 animate-fadeIn">
            <span>
              Filtrando processos de político selecionado.
            </span>
            <button
              onClick={onClearPoliticianFilter}
              className="p-1 rounded-md text-sky-700 hover:text-sky-950 hover:bg-sky-100 font-bold flex items-center gap-1"
            >
              <span>Ver todos os políticos</span>
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

      </div>

      {/* Listagem de Processos */}
      {filteredProcesses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProcesses.map(proc => {
            const badge = getStatusBadge(proc.status);

            return (
              <article 
                key={proc.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow p-6 flex flex-col justify-between"
              >
                <div className="space-y-3.5">
                  
                  {/* Topo: Tribunal e Status */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs px-2.5 py-1 rounded-lg bg-[#0f2744] text-white tracking-wide">
                        {proc.court}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        {proc.processNumber}
                      </span>
                    </div>

                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold border ${badge.bg}`}>
                      {badge.icon}
                      <span>{proc.statusLabel}</span>
                    </div>
                  </div>

                  {/* Político & Cargo */}
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-lg leading-snug">
                      {proc.politicianName}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {proc.politicianRole} · Objeto: <strong className="text-slate-700">{proc.subject}</strong>
                    </p>
                  </div>

                  {/* Resumo da Investigação */}
                  <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-700 space-y-1.5">
                    <span className="font-bold text-slate-900 uppercase tracking-wider text-[10px] block">
                      O que diz o processo / inquérito:
                    </span>
                    <p className="leading-relaxed">
                      {proc.summary}
                    </p>
                  </div>

                  {/* Posicionamento da Defesa */}
                  <div className="bg-sky-50/70 p-3 rounded-xl border border-sky-100 text-xs text-sky-950 space-y-1">
                    <span className="font-bold text-sky-900 uppercase tracking-wider text-[10px] block">
                      Manifestação da Defesa:
                    </span>
                    <p className="italic leading-relaxed">
                      &ldquo;{proc.defensePosition}&rdquo;
                    </p>
                  </div>
                </div>

                {/* Rodapé com Link do Tribunal e Checagem */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <button
                    onClick={() => onInspectPoliticianFactChecks(proc.politicianId)}
                    className="font-bold text-emerald-700 hover:text-emerald-900 hover:underline flex items-center gap-1"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Ver notícias checadas</span>
                  </button>

                  <a 
                    href={proc.courtUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="font-semibold text-slate-500 hover:text-slate-800 hover:underline flex items-center gap-1"
                  >
                    <span>Consulta no {proc.court}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
          <Scale className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Nenhum processo encontrado para esta busca</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Tente alterar o tribunal selecionado ou limpar o termo de pesquisa.
          </p>
          <button
            onClick={() => { setSearchQuery(''); setCourtFilter('TODOS'); setStatusFilter('TODOS'); }}
            className="px-4 py-2 rounded-xl bg-[#0f2744] text-white text-xs font-bold"
          >
            Ver todos os processos
          </button>
        </div>
      )}

      {/* Nota Cívica de Responsabilidade */}
      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
        <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <strong className="text-slate-800">Nota de Responsabilidade Cívica e Presunção de Inocência:</strong> Todas as informações são públicas e extraídas diretamente dos portais da Justiça brasileira. A existência de inquérito ou investigação não configura culpa definitiva, prevalecendo a garantia constitucional da presunção de inocência até trânsito em julgado.
        </div>
      </div>

    </div>
  );
}
