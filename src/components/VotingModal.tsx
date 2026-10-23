'use client';

import React, { useState } from 'react';
import { Candidate, ElectionPoll } from '@/types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Vote, 
  FileText,
  UserCheck
} from 'lucide-react';
import { formatarCPF, validarCPF, registrarVotoSeguro, VoteResult } from '@/lib/voteService';

interface VotingModalProps {
  poll: ElectionPoll;
  candidate: Candidate;
  onClose: () => void;
  onVoteCastSuccess: () => void;
}

export function VotingModal({ poll, candidate, onClose, onVoteCastSuccess }: VotingModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [uf, setUf] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<VoteResult['auditReceipt'] | null>(null);

  const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value));
    setErrorMsg('');
  };

  const handleConfirmVote = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!validarCPF(cpf)) {
      setErrorMsg('CPF inválido. Por favor, confira os números digitados.');
      return;
    }

    if (!nome.trim() || nome.trim().split(/\s+/).length < 2) {
      setErrorMsg('Por favor, informe seu Nome Completo (nome e sobrenome) para auditoria.');
      return;
    }

    if (!cidade.trim()) {
      setErrorMsg('Por favor, informe seu município.');
      return;
    }

    setLoading(true);

    try {
      const res = await registrarVotoSeguro({
        pollId: poll.id,
        candidateId: candidate.id,
        role: poll.role,
        state: poll.state === 'BR' ? uf : poll.state,
        voter: {
          nome,
          cpf,
          uf,
          cidade,
        }
      });

      if (!res.success) {
        setErrorMsg(res.message);
        setLoading(false);
        return;
      }

      setReceipt(res.auditReceipt || null);
      onVoteCastSuccess();
    } catch {
      setErrorMsg('Ocorreu um erro ao processar o voto seguro. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-[#0f2744] text-white p-5 flex items-center justify-between border-b border-[#1e3a5f]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">Urna Cega: Votação Cívica</h3>
              <p className="text-xs text-slate-300">Voto 100% Secreto · Validação por CPF Único</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {receipt ? (
          /* Tela de Comprovante de Votação Auditável */
          <div className="p-6 text-center space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                Voto Computado com Sucesso
              </span>
              <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                Fim de Votação
              </h4>
              <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                Seu voto foi depositado na Urna Cega. Devido ao princípio criptográfico, sua escolha é <strong>totalmente anônima</strong> e não pode ser rastreada.
              </p>
            </div>

            {/* Recibo Cívico */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left text-xs text-slate-700 space-y-2">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Eleitor(a) Auditado(a):</span>
                <span className="font-bold text-slate-900">{receipt.maskedName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Data e Hora:</span>
                <span className="font-medium text-slate-900">{receipt.votedAt}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="font-semibold text-slate-500">Eleição:</span>
                <span className="font-medium text-slate-900">{poll.title}</span>
              </div>
              <div className="flex justify-between items-center text-emerald-800 font-semibold pt-1">
                <span>Paridade Auditável da Urna:</span>
                <span>{receipt.ballotBoxCountAudit} votos = {receipt.voterCountAudit} presenças</span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-[#0f2744] hover:bg-[#1a385c] text-white font-bold text-sm transition-all"
            >
              Concluir e Ver Resultados
            </button>
          </div>
        ) : (
          /* Formulário de Voto e Validação de Eleitor */
          <form onSubmit={handleConfirmVote} className="p-6 space-y-5">
            
            {/* Cartão do Candidato Selecionado */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
              <img 
                src={candidate.photoUrl} 
                alt={candidate.name} 
                className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">
                    {candidate.popularName}
                  </h4>
                  <span className="font-black text-lg text-emerald-700 px-2 py-0.5 bg-emerald-100 rounded-lg">
                    {candidate.number}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{candidate.party} · {poll.role}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">{poll.title}</p>
              </div>
            </div>

            {/* Aviso de Sigilo */}
            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Voto Secreto Garantido:</strong> Seu CPF é usado unicamente para validar que ninguém vote duas vezes. Os dados do voto e do eleitor são gravados em tabelas totalmente desconectadas (urna cega).
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Campos de Identificação do Cidadão */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nome Completo (Para Auditoria Cívica):
                </label>
                <input 
                  type="text" 
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Ex: Maria das Graças Silva"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  CPF (Garante 1 voto único):
                </label>
                <input 
                  type="text" 
                  value={cpf}
                  onChange={handleCpfChange}
                  maxLength={14}
                  placeholder="000.000.000-00"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  required
                />
                <span className="text-[10px] text-slate-500 mt-0.5 block">
                  Seu CPF não é divulgado e é criptografado em hash irreversível.
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Estado (UF):
                  </label>
                  <select
                    value={uf}
                    onChange={(e) => setUf(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600 bg-white"
                  >
                    {ESTADOS_BR.map(ufItem => (
                      <option key={ufItem} value={ufItem}>{ufItem}</option>
                    ))}
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Cidade / Município:
                  </label>
                  <input 
                    type="text" 
                    value={cidade}
                    onChange={(e) => setCidade(e.target.value)}
                    placeholder="Sua cidade"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Botões de Ação estilo Urna */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs uppercase tracking-wider hover:bg-slate-100 transition-colors"
              >
                Corrigir / Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-700/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>CONFIRMA VOTO</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
