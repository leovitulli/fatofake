'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Vote, Users, Lock, Scale, CheckCircle2, UserCheck, Heart } from 'lucide-react';

interface HeaderProps {
  activeTab: 'facts' | 'polls' | 'processes' | 'politicians' | 'security';
  setActiveTab: (tab: 'facts' | 'polls' | 'processes' | 'politicians' | 'security') => void;
  totalChecks: number;
  totalVotes: number;
  totalProcesses: number;
  onOpenPix?: () => void;
}

export function Header({ activeTab, setActiveTab, totalChecks, totalVotes, totalProcesses, onOpenPix }: HeaderProps) {
  const navItems = [
    {
      id: 'facts' as const,
      label: 'Checagens Fato/Fake',
      icon: ShieldCheck,
      badge: `${totalChecks} apuradas`,
    },
    {
      id: 'polls' as const,
      label: 'Pesquisa 2º Turno',
      icon: Vote,
      badge: 'Ao Vivo',
    },
    {
      id: 'processes' as const,
      label: 'Tribunais & Processos',
      icon: Scale,
      badge: `${totalProcesses} autos`,
    },
    {
      id: 'politicians' as const,
      label: 'Dossiê dos Políticos',
      icon: Users,
    },
    {
      id: 'security' as const,
      label: 'Sigilo & Auditoria',
      icon: Lock,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-950/95 backdrop-blur-md border-b border-slate-800/80 text-white">
      {/* Masthead Utility Top Bar */}
      <div className="bg-slate-950 py-1.5 px-4 sm:px-6 lg:px-8 border-b border-slate-900 text-[11px] text-slate-400 font-medium">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span className="text-slate-300 font-semibold tracking-wide">
              22 de Outubro de 2026 · Cobertura Especial do 2º Turno Presidencial
            </span>
          </div>
          <div className="flex items-center gap-3 sm:gap-4 text-slate-400 text-[11px]">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              <span>Consórcio Aberto IFCN</span>
            </span>
            <span className="text-slate-700">·</span>
            <span>Certidões STF &amp; TSE</span>
            <span className="text-slate-700">·</span>
            <span className="text-emerald-400/90 font-medium">Voto 100% Sigiloso</span>
            <span className="text-slate-700">·</span>
            <button
              type="button"
              onClick={() => {
                if (onOpenPix) {
                  onOpenPix();
                } else {
                  const el = document.getElementById('apoie-via-pix');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="text-emerald-300 hover:text-white font-semibold transition-all flex items-center gap-1.5 bg-emerald-500/15 hover:bg-emerald-500/25 px-2.5 py-0.5 rounded-md border border-emerald-500/40 shadow-xs cursor-pointer active:scale-95"
              title="Apoie a plataforma com qualquer valor via PIX"
            >
              <Heart className="w-3 h-3 fill-emerald-400 text-emerald-400" />
              <span>Apoiar via PIX</span>
            </button>
            <span className="text-slate-700">·</span>
            <Link 
              href="/minha-area" 
              className="text-slate-300 hover:text-emerald-400 font-semibold transition-colors flex items-center gap-1.5 bg-slate-900 px-2.5 py-0.5 rounded-md border border-slate-700/80 shadow-xs hover:border-emerald-500/50"
              title="Acessar Minha Área Cívica e Atualizar Cadastro"
            >
              <UserCheck className="w-3 h-3 text-emerald-400" />
              <span>Minha Área Cívica</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Masthead Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Editorial Brand / Masthead Logo */}
          <div 
            onClick={() => setActiveTab('facts')}
            className="flex items-center gap-3 cursor-pointer group select-none"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('facts'); }}
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center shadow-inner group-hover:border-emerald-500/50 transition-colors">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-baseline gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight text-white">FATOS</span>
                <span className="text-xs font-semibold text-emerald-400 tracking-wider">&amp;</span>
                <span className="text-xl font-black tracking-tight text-rose-400">FAKES</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-0.5">
                Jornalismo de Dados Cívico &amp; Tribunais
              </p>
            </div>
          </div>

          {/* Unified Editorial Nav Tabs */}
          <nav className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800/80 overflow-x-auto max-w-full">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium whitespace-nowrap transition-all duration-150 ${
                    isActive
                      ? 'bg-slate-800 text-white font-semibold shadow-sm border border-slate-700/80'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                      isActive 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                        : 'bg-slate-800 text-slate-400'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

        </div>
      </div>
    </header>
  );
}
