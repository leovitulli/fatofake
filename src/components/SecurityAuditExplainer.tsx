'use client';

import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  Users, 
  Database, 
  EyeOff, 
  FileCheck2,
  ExternalLink,
  BookOpen
} from 'lucide-react';

export function SecurityAuditExplainer() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      
      {/* Hero da Seção */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Transparência e Cidadania</span>
        </div>
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">
          Como Funciona o Sigilo do Voto &amp; a Checagem de Fatos
        </h2>
        <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
          Entenda como nossa tecnologia garante que o seu voto na pesquisa seja totalmente secreto e como as notícias são verificadas com rigor documental.
        </p>
      </div>

      {/* Grid de 3 Pilares da Urna Cega */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
            <Lock className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            1. Por que pedimos o CPF?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Para garantir a legitimidade da pesquisa e impedir que pessoas mal-intencionadas, robôs ou fazendas de cliques votem repetidamente para inflar números de candidatos. <strong>1 cidadão = 1 voto único.</strong>
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
            <EyeOff className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            2. Como garantimos o Sigilo?
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Utilizamos a arquitetura de <strong>Urna Cega</strong>: quando você clica em confirmar, seu CPF vai para uma lista de presença criptografada, e sua cédula de voto vai para a urna anônima em tabelas 100% desconectadas. Ninguém sabe em quem você votou.
          </p>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center border border-sky-200">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <h3 className="font-extrabold text-base text-slate-900">
            3. Auditoria Paritária
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            O total de votos na urna deve ser exatamente igual ao total de presenças auditadas. Qualquer discrepância ativa travas de segurança automáticas. A apuração é transparente e aberta ao público.
          </p>
        </div>

      </div>

      {/* Fontes Oficiais Utilizadas */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-emerald-700" />
          <h3 className="text-lg font-bold text-slate-900">
            Nossas Fontes de Checagem &amp; Metodologia Jornalística
          </h3>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Nenhuma classificação de fato ou fake é fruto de opinião ou algoritmo subjetivo. Todas as informações do portal são alimentadas por agências independentes e órgãos oficiais que seguem o código de princípios da <em>International Fact-Checking Network (IFCN)</em>:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2">
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>TSE Fato ou Boato</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Agência Lupa</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Aos Fatos</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>G1 Fato ou Fake</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Estadão Verifica</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs font-bold text-slate-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>UOL Confere</span>
          </div>
        </div>
      </div>

    </div>
  );
}
