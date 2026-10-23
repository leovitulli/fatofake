'use client';

import React, { useState } from 'react';
import { Politician, PoliticalRole } from '@/types';
import { Users, ShieldCheck, CheckCircle2, XCircle, AlertTriangle, ArrowRight, Scale, AlertOctagon } from 'lucide-react';

interface PoliticiansGridProps {
  politicians: Politician[];
  onSelectPolitician: (politicianId: string) => void;
  onInspectProcesses?: (politicianId: string) => void;
}

export function PoliticiansGrid({ politicians, onSelectPolitician, onInspectProcesses }: PoliticiansGridProps) {
  const [roleFilter, setRoleFilter] = useState<string>('TODOS');

  const ROLES: Array<{ label: string; value: string }> = [
    { label: 'Todos os Cargos', value: 'TODOS' },
    { label: 'Presidente / Pré-candidatos 2026', value: 'Presidente' },
    { label: '🚫 Inelegíveis & Condenados', value: 'INELEGIVEL_CONDENADO' },
    { label: 'Governadores', value: 'Governador' },
    { label: 'Senadores', value: 'Senador' },
    { label: 'Deputados Federais', value: 'Deputado Federal' },
  ];

  // Filtro inteligente: busca por cargo atual OU candidatura pretendida em 2026 OU status de inelegibilidade/condenação
  const filteredPoliticians = roleFilter === 'TODOS'
    ? politicians
    : roleFilter === 'INELEGIVEL_CONDENADO'
      ? politicians.filter(p => p.eligibilityStatus === 'INELEGIVEL' || p.eligibilityStatus === 'CONDENADO')
      : politicians.filter(p => p.role === roleFilter || p.candidateFor === roleFilter);

  return (
    <div className="space-y-6">

      {/* Header da Seção */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-sky-800 bg-sky-50 px-3 py-1 rounded-full mb-1">
            <Users className="w-3.5 h-3.5" />
            <span>Fichas Públicas e Histórico de Checagem</span>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Políticos e Termômetro da Verdade
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Acompanhe o balanço de afirmações verdadeiras, boatos desmentidos e situação jurídica (Ficha Limpa / Inelegibilidade).
          </p>
        </div>

        {/* Filtros de Cargos */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
          {ROLES.map(r => (
            <button
              key={r.value}
              onClick={() => setRoleFilter(r.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${roleFilter === r.value
                  ? 'bg-sky-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Políticos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPoliticians.map(politician => (
          <div
            key={politician.id}
            onClick={() => onSelectPolitician(politician.id)}
            className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-sky-300 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              {/* Foto, Nome e Cargo */}
              <div className="flex items-center gap-3.5 mb-3">
                <img
                  src={politician.photoUrl}
                  alt={politician.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-xs font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-md">
                      {politician.party}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">
                      {politician.state !== 'BR' ? `Estado: ${politician.state}` : 'Nacional'}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base leading-snug truncate mt-1">
                    {politician.popularName}
                  </h3>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="text-xs text-slate-500 font-medium">{politician.role}</span>
                    {politician.candidateFor && politician.candidateFor !== politician.role && (
                      <span className="text-[10px] font-bold text-sky-900 bg-sky-100 px-1.5 py-0.2 rounded">
                        Pré-candidato a {politician.candidateFor}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Destaque de Condenação Criminal, Inelegibilidade e Ficha Limpa (Pedido Expresso do Usuário) */}
              {politician.eligibilityStatus === 'CONDENADO' && (
                <div className="mb-3 p-2.5 rounded-2xl bg-rose-100/90 border-2 border-rose-400 text-rose-950 text-xs font-bold flex items-start gap-2 shadow-xs">
                  <AlertOctagon className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-rose-900 uppercase tracking-tight">⛔ Condenado pela Justiça</span>
                    <span className="text-[11px] font-medium text-rose-800 leading-tight block mt-0.5">
                      {politician.eligibilityDetails || 'Condenado em definitivo por órgão judicial colegiado'}
                    </span>
                  </div>
                </div>
              )}

              {politician.eligibilityStatus === 'INELEGIVEL' && (
                <div className="mb-3 p-2.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs font-bold flex items-start gap-2 shadow-xs">
                  <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-rose-800 uppercase tracking-tight">⚠️ Inelegível pelo TSE</span>
                    <span className="text-[11px] font-medium text-rose-700 leading-tight block mt-0.5">
                      {politician.eligibilityDetails || 'Condenado à inelegibilidade pela Justiça Eleitoral'}
                    </span>
                  </div>
                </div>
              )}

              {politician.eligibilityStatus === 'EM_JULGAMENTO' && (
                <div className="mb-3 p-2.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="block font-black text-amber-800 uppercase tracking-tight">⚖️ Em Julgamento no Tribunal</span>
                    <span className="text-[11px] font-medium text-amber-700 leading-tight block mt-0.5">
                      {politician.eligibilityDetails}
                    </span>
                  </div>
                </div>
              )}

              {politician.eligibilityStatus === 'APTO_FICHA_LIMPA' && (
                <div className="mb-3 px-2.5 py-1.5 rounded-xl bg-emerald-50/80 border border-emerald-100 text-xs text-emerald-800 font-semibold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span className="text-[11px] truncate">
                    {politician.eligibilityDetails || 'Ficha Limpa Apto'}
                  </span>
                </div>
              )}

              {/* Bio Curta */}
              <p className="text-xs text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                {politician.bio}
              </p>

              {/* Termômetro da Verdade */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-500">Histórico de Checagens:</span>
                  <span className="font-extrabold text-slate-900">{politician.stats.totalChecks} avaliadas</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-emerald-50 rounded-xl p-1.5 border border-emerald-100">
                    <div className="flex items-center justify-center gap-1 text-emerald-800 font-black text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {politician.stats.fatos}
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold uppercase">Fatos</span>
                  </div>

                  <div className="bg-rose-50 rounded-xl p-1.5 border border-rose-100">
                    <div className="flex items-center justify-center gap-1 text-rose-800 font-black text-sm">
                      <XCircle className="w-3.5 h-3.5" />
                      {politician.stats.fakes}
                    </div>
                    <span className="text-[10px] text-rose-700 font-bold uppercase">Fakes</span>
                  </div>

                  <div className="bg-amber-50 rounded-xl p-1.5 border border-amber-100">
                    <div className="flex items-center justify-center gap-1 text-amber-800 font-black text-sm">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      {politician.stats.enganosos}
                    </div>
                    <span className="text-[10px] text-amber-700 font-bold uppercase">Enganosos</span>
                  </div>
                </div>

                {/* Badge de Processos Judiciais se houver */}
                {politician.stats.judicialProcesses !== undefined && politician.stats.judicialProcesses > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <Scale className="w-3.5 h-3.5 text-sky-800" />
                      <span>Processos / Inquéritos:</span>
                    </div>
                    <span className="font-extrabold text-sky-950 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-100">
                      {politician.stats.judicialProcesses} {politician.stats.judicialProcesses === 1 ? 'caso' : 'casos'}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Ações de Acesso */}
            <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-emerald-800 group-hover:text-emerald-950">
                <span>Ver histórico de checagens</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </div>

              {politician.stats.judicialProcesses && onInspectProcesses && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onInspectProcesses(politician.id);
                  }}
                  className="w-full py-1.5 px-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[11px] font-bold text-sky-900 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Scale className="w-3.5 h-3.5 text-sky-700" />
                  <span>Consultar inquéritos deste político</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
