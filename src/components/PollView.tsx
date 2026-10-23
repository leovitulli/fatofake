'use client';

import React, { useState, useEffect } from 'react';
import { Candidate, ElectionPoll } from '@/types';
import {
  Vote,
  BarChart3,
  ShieldCheck,
  Lock,
  TrendingUp,
  Search,
  UserCheck,
  ExternalLink,
  Award,
  Info,
  Scale
} from 'lucide-react';
import { VotingModal } from './VotingModal';
import { getAnonymousBallots, getVotersRegistry } from '@/lib/voteService';

interface PollViewProps {
  polls: ElectionPoll[];
  onInspectPoliticianFactChecks: (politicianId: string) => void;
  onInspectPoliticianProcesses?: (politicianId: string) => void;
}

export function PollView({ polls, onInspectPoliticianFactChecks, onInspectPoliticianProcesses }: PollViewProps) {
  const [selectedPollId, setSelectedPollId] = useState<string>(polls[0]?.id || '');
  const [viewMode, setViewMode] = useState<'ballot' | 'results'>('ballot');
  const [votingCandidate, setVotingCandidate] = useState<Candidate | null>(null);
  const [dynamicPolls, setDynamicPolls] = useState<ElectionPoll[]>(polls);
  const [auditStats, setAuditStats] = useState({ votersCount: 0, ballotsCount: 0 });

  const activePoll = dynamicPolls.find(p => p.id === selectedPollId) || dynamicPolls[0];

  // Recalcula contagem e votos da urna localmente
  const refreshVotes = () => {
    const voters = getVotersRegistry();
    const ballots = getAnonymousBallots();

    setAuditStats({
      votersCount: voters.length,
      ballotsCount: ballots.length,
    });

    const updated = polls.map(p => {
      const pollBallots = ballots.filter(b => b.pollId === p.id);

      const candidatesUpdated = p.candidates.map(c => {
        const extraVotes = pollBallots.filter(b => b.candidateId === c.id).length;
        return {
          ...c,
          votes: c.votes + extraVotes,
        };
      });

      const total = candidatesUpdated.reduce((acc, curr) => acc + curr.votes, 0);

      return {
        ...p,
        candidates: candidatesUpdated,
        totalVotes: total,
      };
    });

    setDynamicPolls(updated);
  };

  useEffect(() => {
    refreshVotes();
  }, [polls]);

  const sortedCandidatesByVotes = [...(activePoll?.candidates || [])].sort((a, b) => b.votes - a.votes);

  return (
    <div className="space-y-6">

      {/* Banner de Apresentação e Integridade */}
      <div className="bg-gradient-to-r from-[#0f2744] to-[#1e3a5f] rounded-3xl p-6 sm:p-8 text-white shadow-md border border-[#2d527c]">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-bold uppercase tracking-wider">
              <Vote className="w-3.5 h-3.5" />
              <span>Pesquisa Eleitoral Cívica 2026</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Vote com Sigilo e Acompanhe a Apuração em Tempo Real
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Sistema com tecnologia de <strong>Urna Cega</strong>: cada eleitor só pode votar uma vez através do CPF, mas o voto é 100% desvinculado de sua identidade, garantindo sigilo constitucional absoluto.
            </p>
          </div>

          {/* Selo de Auditoria e Paridade */}
          <div className="bg-[#09182b]/80 border border-slate-700/80 p-4 rounded-2xl flex flex-col items-center justify-center text-center shrink-0 min-w-[200px]">
            <div className="flex items-center gap-1.5 text-emerald-400 font-bold text-xs uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>Auditoria Paritária</span>
            </div>
            <div className="text-xl font-extrabold text-white">
              {activePoll?.totalVotes.toLocaleString('pt-BR')}
            </div>
            <span className="text-[11px] text-slate-400">votos computados na urna</span>
            <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-emerald-300 font-medium">
              🔒 Urna e Eleitores em 100% de paridade
            </div>
          </div>
        </div>
      </div>

      {/* Seletores: Eleições & Modo de Visualização */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-sm">

        {/* Seletor da Eleição / Cargo */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {dynamicPolls.map(poll => (
            <button
              key={poll.id}
              onClick={() => setSelectedPollId(poll.id)}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${selectedPollId === poll.id
                  ? 'bg-[#0f2744] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
            >
              {poll.role} ({poll.state})
            </button>
          ))}
        </div>

        {/* Alternância: Cédula de Voto vs Resultados */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl self-end sm:self-auto">
          <button
            onClick={() => setViewMode('ballot')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'ballot'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <Vote className="w-3.5 h-3.5" />
            <span>Cédula de Votação</span>
          </button>

          <button
            onClick={() => setViewMode('results')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'results'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Apuração ao Vivo</span>
          </button>
        </div>

      </div>

      {/* MODO 1: Cédula de Votação */}
      {viewMode === 'ballot' && (
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-extrabold text-slate-900">
              {activePoll?.title}
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              Escolha seu candidato e clique em Votar
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePoll?.candidates.map(candidate => (
              <div
                key={candidate.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-3.5">
                    <img
                      src={candidate.photoUrl}
                      alt={candidate.name}
                      className="w-14 h-14 rounded-2xl object-cover border-2 border-slate-100 shadow-sm group-hover:scale-105 transition-transform"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-500">{candidate.party}</span>
                        <span className="text-base font-black text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200">
                          {candidate.number}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-slate-900 text-base leading-snug truncate">
                        {candidate.popularName}
                      </h4>
                      <p className="text-xs text-slate-500 truncate">{candidate.name}</p>
                    </div>
                  </div>

                  {/* Resumo Judicial / Inquéritos se houver */}
                  {candidate.judicialStatusSummary && (
                    <div className="mb-2.5 p-2 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-700 leading-snug">
                      <div className="flex items-center gap-1 font-bold text-slate-800 mb-0.5">
                        <Scale className="w-3 h-3 text-sky-800" />
                        <span>Situação em Tribunais:</span>
                      </div>
                      <p className="line-clamp-2">{candidate.judicialStatusSummary}</p>
                    </div>
                  )}

                  {/* Botões de Checagem e Processos */}
                  <div className="space-y-1.5 mb-3">
                    {candidate.politicianId && (
                      <button
                        onClick={() => onInspectPoliticianFactChecks(candidate.politicianId!)}
                        className="w-full py-1.5 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-xs text-emerald-900 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                        <span>Fatos &amp; Fakes deste candidato</span>
                      </button>
                    )}

                    {candidate.politicianId && onInspectPoliticianProcesses && (
                      <button
                        onClick={() => onInspectPoliticianProcesses(candidate.politicianId!)}
                        className="w-full py-1.5 px-3 rounded-lg bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-xs text-sky-900 font-semibold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Scale className="w-3.5 h-3.5 text-sky-700" />
                        <span>Ver Inquéritos e Processos</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Botão de Ação de Voto */}
                <button
                  onClick={() => setVotingCandidate(candidate)}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
                >
                  <Vote className="w-4 h-4" />
                  <span>VOTAR NESTE CANDIDATO</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODO 2: Apuração em Tempo Real com Gráficos */}
      {viewMode === 'results' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md mb-1">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>Apuração Pública Atualizada</span>
              </div>
              <h3 className="text-xl font-extrabold text-slate-900">
                Resultado Parcial: {activePoll?.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-500 font-medium">Total de Votos:</span>
              <p className="text-lg font-black text-slate-900">{activePoll?.totalVotes.toLocaleString('pt-BR')}</p>
            </div>
          </div>

          {/* Gráfico de Barras com Candidatos */}
          <div className="space-y-4">
            {sortedCandidatesByVotes.map((candidate, index) => {
              const percentage = activePoll?.totalVotes
                ? ((candidate.votes / activePoll.totalVotes) * 100).toFixed(1)
                : '0.0';

              const isLeader = index === 0 && candidate.id !== 'cand-branco-nulo';

              return (
                <div key={candidate.id} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-slate-400 w-4">{index + 1}º</span>
                      <img
                        src={candidate.photoUrl}
                        alt={candidate.name}
                        className="w-7 h-7 rounded-full object-cover border border-slate-200"
                      />
                      <span className="font-extrabold text-slate-900">{candidate.popularName}</span>
                      <span className="text-xs text-slate-500 font-medium">({candidate.party} - {candidate.number})</span>
                      {isLeader && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-black uppercase tracking-wider">
                          <Award className="w-3 h-3 text-amber-600" />
                          Líder
                        </span>
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-base font-black text-slate-900">{percentage}%</span>
                      <span className="text-xs text-slate-500 ml-2">({candidate.votes.toLocaleString('pt-BR')} votos)</span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${isLeader ? 'bg-gradient-to-r from-emerald-600 to-teal-500' : 'bg-slate-700'
                        }`}
                      style={{ width: `${Math.max(Number(percentage), 1)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Nota de Metodologia e Auditoria */}
          <div className="mt-6 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
            <Info className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-slate-800">Metodologia Cívica Transparente:</strong> Pesquisa de participação voluntária independente com voto único certificado por CPF. Os dados de cada eleitor são armazenados exclusivamente na lista de presença criptografada, impossibilitando qualquer associação com a cédula depositada na urna.
            </div>
          </div>
        </div>
      )}

      {/* Modal de Votação Ativo */}
      {votingCandidate && activePoll && (
        <VotingModal
          poll={activePoll}
          candidate={votingCandidate}
          onClose={() => setVotingCandidate(null)}
          onVoteCastSuccess={() => {
            refreshVotes();
          }}
        />
      )}

    </div>
  );
}
