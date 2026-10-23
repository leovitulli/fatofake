'use client';

import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Copy, 
  Check, 
  ShieldCheck, 
  Sparkles, 
  QrCode, 
  Server, 
  CheckCircle2, 
  ExternalLink,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { PIX_CONFIG } from '@/config/pixConfig';
import { PixSettings, getLocalPixSettings, fetchRemotePixSettings } from '@/lib/pixService';

interface PixDonationSectionProps {
  id?: string;
  className?: string;
  compact?: boolean;
}

export function PixDonationSection({ id = 'apoie-via-pix', className = '', compact = false }: PixDonationSectionProps) {
  const [copied, setCopied] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string | null>(null);
  const [pixSettings, setPixSettings] = useState<PixSettings>(getLocalPixSettings());

  useEffect(() => {
    // Sincroniza configurações dinâmicas da plataforma
    fetchRemotePixSettings().then(setPixSettings);

    // Escuta evento em tempo real se o gestor alterar o switch ou a chave
    const handleUpdated = (e: Event) => {
      const custom = e as CustomEvent<PixSettings>;
      if (custom.detail) {
        setPixSettings(custom.detail);
      }
    };

    window.addEventListener('fatosfakes_pix_updated', handleUpdated);
    return () => window.removeEventListener('fatosfakes_pix_updated', handleUpdated);
  }, []);

  const handleCopyPix = () => {
    const keyToCopy = pixSettings.chave || PIX_CONFIG.chave;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(keyToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  };

  // Se o gestor desabilitou o PIX na plataforma, a seção inteira é omitida
  if (!pixSettings.enabled) {
    return null;
  }

  const currentKey = pixSettings.chave || PIX_CONFIG.chave;
  const currentKeyType = pixSettings.tipoChave || PIX_CONFIG.tipoChave;
  const currentTitular = pixSettings.titular || PIX_CONFIG.titular;

  // Modo discreto / compacto para o Perfil Cívico do Eleitor
  if (compact) {
    return (
      <section id={id} className={`transition-all duration-300 ${className}`}>
        <div className="rounded-2xl bg-[#0b1524]/60 border border-slate-800/80 p-4 sm:p-5 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/60">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <Heart className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400/20" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">
                  Apoio Cívico à Manutenção (Opcional)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Projeto autônomo sem financiamento partidário ou verbas públicas.
                </p>
              </div>
            </div>
            <div className="text-[11px] text-slate-500 font-mono">
              Chave: <span className="text-slate-300 uppercase">{currentKeyType}</span>
            </div>
          </div>

          <div className="mt-3 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-[#060c16] border border-slate-800 rounded-xl px-3.5 py-2 font-mono text-xs text-emerald-300 select-all overflow-x-auto whitespace-nowrap">
              {currentKey}
            </div>

            <button
              type="button"
              onClick={handleCopyPix}
              className={`px-4 py-2 rounded-xl font-bold text-xs transition-all shadow-sm flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                copied
                  ? 'bg-emerald-500 text-slate-950'
                  : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 active:scale-95'
              }`}
              title="Copiar Chave PIX"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copiar PIX</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-2.5 flex items-center justify-between text-[10px] text-slate-500">
            <span>Titular: {currentTitular}</span>
            <span>Destinação: Infraestrutura de servidores &amp; apuração</span>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section 
      id={id} 
      className={`scroll-mt-24 transition-all duration-300 ${className}`}
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#0b1728] via-[#091322] to-[#060c16] border border-emerald-500/30 p-6 sm:p-10 shadow-2xl shadow-emerald-950/20">
        
        {/* Efeito sutil de iluminação de fundo (Emerald / Slate) */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        {/* Top Header Badge */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold tracking-wide">
              <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
              <span>Financiamento Cívico Coletivo</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Apoie a Plataforma FATOS &amp; FAKES via PIX
            </h2>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Não recebemos verba governamental, dinheiro de partidos nem verba de candidatos. 
              Nossa tecnologia de urna cega auditável, checagens de fatos e servidores são mantidos por cidadãos comprometidos com a verdade.
            </p>
          </div>

          {/* Selo PIX Oficial BACEN */}
          <div className="flex items-center gap-3 bg-slate-900/90 border border-slate-800 p-3.5 rounded-2xl shrink-0 self-start md:self-center shadow-inner">
            <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/40 flex items-center justify-center text-teal-400 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[11px] font-bold text-teal-400 uppercase tracking-wider flex items-center gap-1">
                <span>PIX Instantâneo</span>
                <CheckCircle2 className="w-3 h-3" />
              </div>
              <div className="text-xs text-slate-300 font-semibold">
                Direto ao Projeto
              </div>
            </div>
          </div>
        </div>

        {/* Corpo Principal: Chave PIX + QR Code + Valores */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8 items-center">
          
          {/* Coluna 1: Copiar Chave + Informações (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Box da Chave PIX com 1-Click Copy */}
            <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-inner">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-400 font-medium">Chave PIX Oficial:</span>
                <span className="text-emerald-400 font-semibold text-[11px] uppercase tracking-wider">
                  {pixSettings.tipoChave || PIX_CONFIG.tipoChave}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-4 py-3 font-mono text-sm sm:text-base font-bold text-emerald-300 select-all overflow-x-auto whitespace-nowrap">
                  {pixSettings.chave || PIX_CONFIG.chave}
                </div>

                <button
                  type="button"
                  onClick={handleCopyPix}
                  className={`px-5 py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer shrink-0 ${
                    copied 
                      ? 'bg-emerald-500 text-slate-950 font-black' 
                      : 'bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 shadow-emerald-500/20'
                  }`}
                  title="Copiar Chave PIX"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>Chave Copiada!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copiar Chave PIX</span>
                    </>
                  )}
                </button>
              </div>

              {/* Mensagem de confirmação de cópia */}
              {copied && (
                <div className="mt-3 p-2.5 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Chave copiada com sucesso! Abra o app do seu banco, escolha PIX e cole a chave.</span>
                </div>
              )}

              {/* Metadados bancários de transparência */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
                <div>
                  <strong className="text-slate-300">Titular:</strong> {pixSettings.titular || PIX_CONFIG.titular}
                </div>
                <div>
                  <strong className="text-slate-300">Destinação:</strong> {pixSettings.proposito || PIX_CONFIG.proposito}
                </div>
              </div>
            </div>

            {/* Faixas Sugeridas de Contribuição */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2.5">
                Valores Sugeridos de Apoio Cívico:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {PIX_CONFIG.faixasSugeridas.map((faixa) => {
                  const isSelected = selectedTier === faixa.valor;
                  return (
                    <button
                      key={faixa.valor}
                      type="button"
                      onClick={() => {
                        setSelectedTier(faixa.valor);
                        handleCopyPix();
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected 
                          ? 'bg-emerald-500/20 border-emerald-500/80 shadow-md shadow-emerald-500/10' 
                          : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="text-base font-black text-white flex items-center justify-between">
                        <span>{faixa.valor}</span>
                        <Sparkles className="w-3 h-3 text-emerald-400 opacity-60" />
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1 leading-snug line-clamp-2">
                        {faixa.descricao}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Garantias de Transparência */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>100% Independente</span>
              </div>
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>Mantém Nuvem &amp; Banco</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Sem Anúncios Invasivos</span>
              </div>
            </div>

          </div>

          {/* Coluna 2: QR Code Visual + Instruções Rápidas (5 cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center bg-slate-900/60 border border-slate-800 rounded-2xl p-6 text-center">
            
            <div className="relative p-4 rounded-2xl bg-white shadow-xl shadow-black/40 mb-4 border-4 border-slate-800">
              {/* Ilustração Visual Vetorial de QR Code de Alta Definição */}
              <svg 
                className="w-44 h-44 sm:w-48 sm:h-48 text-slate-950" 
                viewBox="0 0 100 100" 
                fill="currentColor"
              >
                {/* Marcadores dos 3 cantos (Finder Patterns) */}
                <rect x="5" y="5" width="26" height="26" rx="4" />
                <rect x="9" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="13" y="13" width="10" height="10" rx="1" />

                <rect x="69" y="5" width="26" height="26" rx="4" />
                <rect x="73" y="9" width="18" height="18" fill="white" rx="2" />
                <rect x="77" y="13" width="10" height="10" rx="1" />

                <rect x="5" y="69" width="26" height="26" rx="4" />
                <rect x="9" y="73" width="18" height="18" fill="white" rx="2" />
                <rect x="13" y="77" width="10" height="10" rx="1" />

                {/* Módulos de Dados decorativos autênticos */}
                <rect x="36" y="8" width="6" height="6" />
                <rect x="46" y="8" width="8" height="6" />
                <rect x="58" y="8" width="6" height="6" />
                <rect x="36" y="18" width="8" height="6" />
                <rect x="48" y="18" width="6" height="6" />
                <rect x="58" y="18" width="8" height="6" />

                <rect x="8" y="36" width="6" height="8" />
                <rect x="18" y="36" width="8" height="6" />
                <rect x="28" y="36" width="6" height="8" />
                <rect x="38" y="34" width="8" height="8" />
                <rect x="50" y="34" width="8" height="8" />
                <rect x="62" y="34" width="8" height="8" />
                <rect x="74" y="36" width="8" height="6" />
                <rect x="86" y="36" width="6" height="8" />

                <rect x="8" y="48" width="8" height="6" />
                <rect x="20" y="48" width="6" height="8" />
                <rect x="34" y="48" width="12" height="6" />
                <rect x="54" y="48" width="12" height="6" />
                <rect x="72" y="48" width="8" height="6" />
                <rect x="84" y="48" width="8" height="6" />

                <rect x="8" y="58" width="6" height="6" />
                <rect x="18" y="58" width="8" height="6" />
                <rect x="36" y="58" width="6" height="8" />
                <rect x="46" y="58" width="8" height="6" />
                <rect x="58" y="58" width="6" height="8" />
                <rect x="74" y="58" width="6" height="6" />
                <rect x="84" y="58" width="8" height="6" />

                <rect x="36" y="72" width="8" height="6" />
                <rect x="48" y="72" width="6" height="6" />
                <rect x="58" y="72" width="8" height="6" />
                <rect x="72" y="72" width="6" height="8" />
                <rect x="82" y="72" width="10" height="6" />

                <rect x="36" y="82" width="6" height="8" />
                <rect x="46" y="82" width="10" height="6" />
                <rect x="60" y="82" width="6" height="8" />
                <rect x="72" y="84" width="8" height="6" />
                <rect x="84" y="82" width="8" height="8" />

                {/* Emblema Central PIX */}
                <circle cx="50" cy="50" r="11" fill="white" />
                <circle cx="50" cy="50" r="9" fill="#0b1728" />
                <path d="M47 47 L53 53 M53 47 L47 53" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />
              </svg>
            </div>

            <div className="space-y-1">
              <p className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pix Copia e Cola ou QR Code</span>
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs leading-relaxed">
                Abra o aplicativo de qualquer banco no celular, escolha <strong>Área Pix</strong> e aponte a câmera ou use a chave copiada ao lado.
              </p>
            </div>

            <button
              type="button"
              onClick={handleCopyPix}
              className="mt-4 text-xs font-semibold text-emerald-400 hover:text-emerald-300 underline underline-offset-4 cursor-pointer transition-colors"
            >
              Clique aqui para copiar a chave diretamente
            </button>
          </div>

        </div>

        {/* Rodapé Interno com Instrução Amigável para o Gestor / Administrador */}
        <div className="relative z-10 mt-8 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>
              Qualquer quantia, de R$ 1 a R$ 100, é destinada exclusivamente à infraestrutura tecnológica do portal.
            </span>
          </div>
          <div className="text-slate-400 font-mono text-[10px] bg-slate-950 px-2.5 py-1 rounded-md border border-slate-800">
            Chave configurável em <span className="text-slate-200 font-bold">src/config/pixConfig.ts</span>
          </div>
        </div>

      </div>
    </section>
  );
}
