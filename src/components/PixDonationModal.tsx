'use client';

import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Copy, 
  Check, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  QrCode,
  Info
} from 'lucide-react';
import { PIX_CONFIG } from '@/config/pixConfig';

interface PixDonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PixDonationModal({ isOpen, onClose }: PixDonationModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyPix = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(PIX_CONFIG.chave);
      setCopied(true);
      setTimeout(() => setCopied(false), 4000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-[#0b1728] border border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden text-white my-auto max-h-[92vh] overflow-y-auto">
        
        {/* Glow de fundo */}
        <div className="absolute -top-24 -right-24 w-60 h-60 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

        {/* Botão Fechar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header do Modal */}
        <div className="text-center space-y-2 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
            <Heart className="w-3.5 h-3.5 fill-emerald-400 text-emerald-400" />
            <span>Apoio Cívico e Independente</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Contribua via PIX para o FATOS &amp; FAKES
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Sua contribuição mantém os servidores de auditoria de votos e checagens documentais livres de qualquer dependência partidária ou estatal.
          </p>
        </div>

        {/* Box da Chave PIX */}
        <div className="bg-[#050b14] border border-slate-800 rounded-2xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Chave PIX Oficial:</span>
            <span className="text-emerald-400 font-semibold">{PIX_CONFIG.tipoChave}</span>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3.5 py-2.5 font-mono text-sm font-bold text-emerald-300 select-all overflow-x-auto whitespace-nowrap">
              {PIX_CONFIG.chave}
            </div>
            <button
              type="button"
              onClick={handleCopyPix}
              className={`px-4 py-2.5 rounded-xl font-bold text-xs tracking-wide transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shrink-0 ${
                copied 
                  ? 'bg-emerald-500 text-slate-950 font-black' 
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Copiada!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copiar</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <div className="p-2 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Chave copiada! Abra seu banco e cole a chave no PIX.</span>
            </div>
          )}

          <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-800 flex justify-between">
            <span><strong>Titular:</strong> {PIX_CONFIG.titular}</span>
          </div>
        </div>

        {/* Sugestões de Valores */}
        <div className="grid grid-cols-4 gap-2 mb-5">
          {['R$ 5', 'R$ 10', 'R$ 20', 'R$ 50'].map(val => (
            <button
              key={val}
              type="button"
              onClick={handleCopyPix}
              className="py-2 px-2 text-center rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
            >
              {val}
            </button>
          ))}
        </div>

        {/* Garantias */}
        <div className="space-y-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span>100% voltado aos custos de infraestrutura e apurações.</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
            <span>Transferência direta e sem intermediários corporativos.</span>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            Concluir / Fechar
          </button>
        </div>

      </div>
    </div>
  );
}
