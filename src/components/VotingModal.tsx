'use client';

import React, { useState, useRef } from 'react';
import { Candidate, ElectionPoll } from '@/types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  Vote, 
  FileText,
  UserCheck,
  Mail,
  Phone,
  Fingerprint,
  Info,
  PenTool,
  ShieldAlert,
  Shield
} from 'lucide-react';
import { 
  formatarCPF, 
  formatarTelefone, 
  validarCPF, 
  registrarVotoSeguro, 
  VoteResult 
} from '@/lib/voteService';

interface VotingModalProps {
  poll: ElectionPoll;
  candidate: Candidate;
  onClose: () => void;
  onVoteCastSuccess: () => void;
}

export function VotingModal({ poll, candidate, onClose, onVoteCastSuccess }: VotingModalProps) {
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [email, setEmail] = useState('');
  const [celular, setCelular] = useState('');
  const [uf, setUf] = useState('SP');
  const [cidade, setCidade] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [receipt, setReceipt] = useState<VoteResult['auditReceipt'] | null>(null);

  // Estados do Escudo Anti-Robô / Anti-IA
  const openedAtRef = useRef<number>(Date.now());
  const [isHumanChecked, setIsHumanChecked] = useState(false);
  const [honeypotTrap, setHoneypotTrap] = useState('');

  const ESTADOS_BR = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCpf(formatarCPF(e.target.value));
    setErrorMsg('');
  };

  const handleCelularChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCelular(formatarTelefone(e.target.value));
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
      setErrorMsg('Por favor, informe seu Nome Completo (nome e sobrenome) para a auditoria cívica.');
      return;
    }

    if (!email.trim() && !celular.trim()) {
      setErrorMsg('Por favor, informe ao menos um meio de contato (E-mail ou Celular/WhatsApp) para validação do registro.');
      return;
    }

    if (!cidade.trim()) {
      setErrorMsg('Por favor, informe seu município.');
      return;
    }

    if (!isHumanChecked) {
      setErrorMsg('Por favor, marque a confirmação cívica "Sou um eleitor humano" para ativar a proteção anti-robô.');
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
          email,
          phone: celular,
          uf,
          cidade,
        },
        securityVerification: {
          botTrap: honeypotTrap,
          elapsedMs: Date.now() - openedAtRef.current,
          humanVerified: isHumanChecked,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Top Header Editorial */}
        <div className="bg-[#0b1524] text-white p-4 sm:p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <Vote className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base leading-tight">Urna Cívica Cega</h3>
                <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30">
                  Voto Único
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">Validação de Autenticidade &amp; Sigilo Constitucional</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          {receipt ? (
            /* Tela de Comprovante de Votação Auditável */
            <div className="text-center space-y-4 py-2">
              <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Presença &amp; Voto Confirmados
                </span>
                <h4 className="text-xl font-extrabold text-slate-900 mt-2">
                  Voto Computado com Sucesso!
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto leading-relaxed">
                  Sua cédula foi depositada na <strong>Urna Cega</strong>. Conforme o Art. 14 da Constituição Federal, sua escolha é <strong>100% anônima e inviolável</strong>.
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
                  <span className="font-semibold text-slate-500">Eleição / Pesquisa:</span>
                  <span className="font-medium text-slate-900">{poll.title}</span>
                </div>
                <div className="flex justify-between items-center text-emerald-800 font-semibold pt-1">
                  <span>Auditoria Cívica:</span>
                  <span>1 Eleitor Real = 1 Voto Único Registrado</span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all shadow-md"
              >
                Concluir e Ver Resultados da Pesquisa
              </button>
            </div>
          ) : (
            /* Formulário de Voto com Explicação Visual Decorativa */
            <form onSubmit={handleConfirmVote} className="space-y-5">
              
              {/* Cartão do Candidato Selecionado */}
              <div className="flex items-center gap-3.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                <img 
                  src={candidate.photoUrl} 
                  alt={candidate.name} 
                  className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow-sm shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-slate-900 text-sm leading-tight truncate">
                      {candidate.popularName}
                    </h4>
                    <span className="font-black text-base text-emerald-700 px-2.5 py-0.5 bg-emerald-100 rounded-lg shrink-0">
                      {candidate.number}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 font-medium">{candidate.party} · {poll.role}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5 truncate">{poll.title}</p>
                </div>
              </div>

              {/* BLOCO EXPLICATIVO VISUAL COM ÍCONES E IMAGENS DECORATIVAS */}
              <div className="bg-slate-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-inner space-y-3.5">
                <div className="flex items-center gap-2 text-emerald-400">
                  <PenTool className="w-4 h-4 shrink-0" />
                  <h4 className="text-xs sm:text-sm font-black tracking-tight text-white">
                    Por que solicitamos seu cadastro? (Princípio do Abaixo-Assinado Oficial)
                  </h4>
                </div>

                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Para que uma pesquisa cívica tenha <strong>peso real, seriedade e não seja manipulada por robôs ou votos falsos</strong>, adotamos o mesmo critério de um <strong>abaixo-assinado cívico oficial</strong>:
                </p>

                {/* Grid Visual dos 3 Pilares Decorativos */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                  
                  {/* Pilar 1: Abaixo Assinado Cívico */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                      <UserCheck className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-white mb-0.5">Cidadão Real</h5>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Comprova que é uma pessoa de verdade, como em um abaixo-assinado sério.
                      </p>
                    </div>
                  </div>

                  {/* Pilar 2: 1 Pessoa = 1 Voto */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-sky-500/10 text-sky-400 flex items-center justify-center mb-2 border border-sky-500/20">
                      <Fingerprint className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-white mb-0.5">Voto Único</h5>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        O CPF impede matematicamente que alguém vote 2 vezes na mesma eleição.
                      </p>
                    </div>
                  </div>

                  {/* Pilar 3: Sigilo Absoluto */}
                  <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex flex-col justify-between">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-2 border border-emerald-500/20">
                      <Lock className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <h5 className="text-[11px] font-bold text-white mb-0.5">Sigilo Oculto</h5>
                      <p className="text-[10px] text-slate-400 leading-snug">
                        Seu voto vai para a urna cega. Ninguém consegue saber sua escolha.
                      </p>
                    </div>
                  </div>

                </div>

                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 pt-1 border-t border-slate-900">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  <span>Seus dados registram apenas a sua PRESENÇA (Constituição Federal, Art. 14).</span>
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
                    Nome Completo: <span className="text-rose-500">*</span>
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
                    CPF (Garante que cada cidadão vote apenas 1 vez): <span className="text-rose-500">*</span>
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
                    Validado matematicamente pela Receita Federal e protegido com hash SHA-256 irreversível.
                  </span>
                </div>

                {/* Novos Campos: E-mail e Celular / WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span>E-mail:</span>
                    </label>
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>Celular / WhatsApp:</span>
                    </label>
                    <input 
                      type="tel" 
                      value={celular}
                      onChange={handleCelularChange}
                      maxLength={15}
                      placeholder="(00) 00000-0000"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Estado (UF): <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={uf}
                      onChange={(e) => setUf(e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                    >
                      {ESTADOS_BR.map(estado => (
                        <option key={estado} value={estado}>{estado}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cidade / Município: <span className="text-rose-500">*</span>
                    </label>
                    <input 
                      type="text" 
                      value={cidade}
                      onChange={(e) => setCidade(e.target.value)}
                      placeholder="Ex: São Paulo"
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-600"
                      required
                    />
                  </div>
                </div>

                {/* Escudo Anti-Robô & IA (Verificação Cívica Humana) */}
                <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200/90 text-left">
                  <div className="flex items-start gap-2.5">
                    <input
                      type="checkbox"
                      id="human-verify"
                      checked={isHumanChecked}
                      onChange={(e) => setIsHumanChecked(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                      required
                    />
                    <label htmlFor="human-verify" className="text-xs text-slate-700 leading-snug font-medium cursor-pointer">
                      <span className="font-bold text-slate-900 block flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-emerald-600" />
                        Declaração Cívica Anti-Robô &amp; IA
                      </span>
                      Confirmo que sou um cidadão real e que este voto representa minha decisão individual e consciente, sem automação.
                    </label>
                  </div>
                  
                  {/* Honeypot field invisível para humanos, mas preenchido por scrapers e robôs */}
                  <div className="hidden" aria-hidden="true" style={{ display: 'none', position: 'absolute', left: '-9999px' }}>
                    <label htmlFor="website-trap">Não preencha este campo</label>
                    <input
                      type="text"
                      id="website-trap"
                      name="website-trap"
                      value={honeypotTrap}
                      onChange={(e) => setHoneypotTrap(e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>
                </div>

              </div>

              {/* Botões de Ação */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/3 py-3 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-2/3 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Registrando na Urna Cega...</span>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Confirmar Voto Seguro &amp; Sigiloso</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
