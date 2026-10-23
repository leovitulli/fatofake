'use client';

import React, { useState, useMemo } from 'react';
import { FactCheck } from '@/types';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Share2, 
  ExternalLink, 
  ChevronDown, 
  ChevronUp, 
  Check, 
  Sparkles,
  Building2,
  Calendar,
  Globe,
  ShieldCheck,
  FileText,
  Search,
  BookOpen,
  Scale,
  ArrowUpRight,
  AlertOctagon,
  Quote
} from 'lucide-react';
import { ClaimReviewSchema } from './ClaimReviewSchema';

interface FactCheckCardProps {
  factCheck: FactCheck;
  onFilterByPolitician?: (politicianId: string) => void;
}

export function FactCheckCard({ factCheck, onFilterByPolitician }: FactCheckCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const getVerdictStyle = (verdict: string) => {
    switch (verdict) {
      case 'FATO':
        return {
          bg: 'bg-emerald-50/70 border-emerald-300/80 text-emerald-950',
          badge: 'bg-emerald-600 text-white border-emerald-700',
          badgeText: 'text-emerald-700 bg-emerald-50 border-emerald-200',
          icon: <CheckCircle2 className="w-4 h-4 text-white" />,
          label: 'É FATO (VERDADEIRO)',
          accentBorder: 'border-l-4 border-l-emerald-600',
        };
      case 'FAKE':
        return {
          bg: 'bg-rose-50/70 border-rose-300/80 text-rose-950',
          badge: 'bg-rose-600 text-white border-rose-700',
          badgeText: 'text-rose-700 bg-rose-50 border-rose-200',
          icon: <AlertOctagon className="w-4 h-4 text-white" />,
          label: 'É FAKE (DESMENTIDO)',
          accentBorder: 'border-l-4 border-l-rose-600',
        };
      case 'ENGANOSO':
      default:
        return {
          bg: 'bg-amber-50/70 border-amber-300/80 text-amber-950',
          badge: 'bg-amber-600 text-white border-amber-700',
          badgeText: 'text-amber-800 bg-amber-50 border-amber-200',
          icon: <AlertTriangle className="w-4 h-4 text-white" />,
          label: 'ENGANOSO / FORA DE CONTEXTO',
          accentBorder: 'border-l-4 border-l-amber-600',
        };
    }
  };

  const style = getVerdictStyle(factCheck.verdict);

  // Consolidação de múltiplas fontes de checagem com redundância total contra 404
  const verifiedSources = useMemo(() => {
    const list: Array<{
      title: string;
      agency: string;
      url: string;
      type: 'agencia' | 'tribunal' | 'auditoria' | 'imprensa';
      badgeColor: string;
    }> = [];

    // 1. Reportagem da Agência Checadora Principal
    list.push({
      title: `Reportagem no ${factCheck.sourceAgency}`,
      agency: factCheck.sourceAgency,
      url: factCheck.sourceUrl,
      type: 'agencia',
      badgeColor: 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
    });

    // 2. Prova Oficial / Tribunal / Diário Oficial (quando houver)
    if (factCheck.officialProofUrl) {
      list.push({
        title: factCheck.officialProofUrl.name,
        agency: 'Tribunal / Documento Oficial',
        url: factCheck.officialProofUrl.url,
        type: 'tribunal',
        badgeColor: 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100',
      });
    }

    // 3. Múltiplas fontes adicionais cadastradas no dossiê
    if (factCheck.sources && factCheck.sources.length > 0) {
      for (const src of factCheck.sources) {
        if (!list.some(l => l.url === src.url)) {
          list.push({
            title: src.name,
            agency: src.name,
            url: src.url,
            type: src.type === 'tribunal' ? 'tribunal' : 'agencia',
            badgeColor: src.type === 'tribunal' 
              ? 'bg-sky-50 text-sky-900 border-sky-200 hover:bg-sky-100' 
              : 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100',
          });
        }
      }
    }

    // 4. Auditoria Pública no Google Fact Check Tools (IFCN) - Garante consulta direta a todas as agências mundiais
    list.push({
      title: 'Auditoria Aberta no Fact Check Tools (Consórcio IFCN)',
      agency: 'Consórcio Internacional de Checagem',
      url: `https://toolbox.google.com/factcheck/explorer/search/list:recent;query=${encodeURIComponent(factCheck.title)}`,
      type: 'auditoria',
      badgeColor: 'bg-indigo-50 text-indigo-900 border-indigo-200 hover:bg-indigo-100',
    });

    // 5. Cobertura da Imprensa no Google Notícias
    list.push({
      title: 'Pesquisa da Cobertura de Imprensa (Google Notícias)',
      agency: 'Imprensa Nacional',
      url: `https://news.google.com/search?q=${encodeURIComponent(factCheck.politician.name + ' ' + factCheck.title)}&hl=pt-BR&gl=BR&ceid=BR%3Apt-419`,
      type: 'imprensa',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 hover:bg-slate-200',
    });

    return list;
  }, [factCheck]);

  const handleShareWhatsApp = () => {
    const text = 
`🔍 *FATOS & FAKES - CHECAGEM CÍVICA OFICIAL*
*Alegação viral:* "${factCheck.title}"

*VEREDITO:* ${style.label}
*A Verdade:* ${factCheck.summary}

📌 *Fontes de Verificação Auditadas:*
1. ${factCheck.sourceAgency}: ${factCheck.sourceUrl}
${factCheck.officialProofUrl ? `2. Prova Oficial: ${factCheck.officialProofUrl.name} (${factCheck.officialProofUrl.url})\n` : ''}
🔗 Consulte na íntegra e audite as provas: https://fatosfakes.com.br`;

    navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <article 
      className={`relative bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col justify-between group ${style.accentBorder}`}
    >
      <ClaimReviewSchema factCheck={factCheck} />

      <div className="p-5 sm:p-6 pb-4">
        
        {/* Topo do Card: Veredito, Categoria e Data */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full font-black text-xs tracking-wide shadow-xs border ${style.badge}`}>
              {style.icon}
              <span>{style.label}</span>
            </span>
            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {factCheck.category}
            </span>
            {factCheck.isLiveResult && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 text-sky-900 border border-sky-300">
                <Globe className="w-3 h-3 text-sky-700 animate-spin" />
                <span>Web ao Vivo</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{new Date(factCheck.publishedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        {/* Informações do Político ou Tema Envolvido */}
        <div className="flex items-center gap-3 mb-4 bg-slate-50/90 p-2.5 rounded-2xl border border-slate-200/80">
          <img 
            src={factCheck.politician.photoUrl} 
            alt={factCheck.politician.name} 
            className="w-11 h-11 rounded-xl object-cover border border-white shadow-xs shrink-0"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 
                onClick={() => onFilterByPolitician?.(factCheck.politician.id)}
                className="text-sm font-extrabold text-slate-900 truncate hover:text-emerald-700 hover:underline cursor-pointer"
              >
                {factCheck.politician.name}
              </h4>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-800">
                {factCheck.politician.id === 'tema-aberto' || factCheck.politician.id === 'pesquisa-web'
                  ? 'Apuração Aberta'
                  : factCheck.politician.party}
              </span>
            </div>
            <p className="text-xs text-slate-500 truncate">
              {factCheck.politician.id === 'tema-aberto' || factCheck.politician.id === 'pesquisa-web'
                ? 'Investigação / Noticiário em Tempo Real'
                : `${factCheck.politician.role} ${factCheck.politician.state !== 'BR' ? `· ${factCheck.politician.state}` : ''}`}
            </p>
          </div>
        </div>

        {/* Título Principal / Boato */}
        <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug mb-3">
          &ldquo;{factCheck.title}&rdquo;
        </h3>

        {/* O que circulou nas redes (Chamada em destaque) */}
        {factCheck.viralClaim && (
          <div className="text-xs text-slate-700 bg-amber-50/60 border border-amber-200/80 rounded-2xl p-3 mb-4 flex items-start gap-2.5">
            <Quote className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong className="text-amber-950 block text-[11px] uppercase tracking-wider mb-0.5">
                Alegação que circulou nas redes:
              </strong>
              <p className="italic text-slate-800 line-clamp-2">&ldquo;{factCheck.viralClaim}&rdquo;</p>
            </div>
          </div>
        )}

        {/* Caixa da Verdade Comprovada */}
        <div className={`p-4 rounded-2xl border ${style.bg} mb-4 shadow-xs`}>
          <div className="flex items-center gap-1.5 text-xs font-black tracking-wider uppercase mb-1 opacity-90">
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>A Realidade Factual:</span>
          </div>
          <p className="text-sm sm:text-base font-semibold leading-relaxed">
            {factCheck.summary}
          </p>
        </div>

        {/* Painel de Auditoria e Fontes Verificadas (Múltiplas Agências e Tribunais) */}
        <div className="mb-4 p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/90 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
              <span>Fontes da Checagem ({verifiedSources.length}):</span>
            </span>
            <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100/70 px-2 py-0.5 rounded-full">
              ✅ Links Auditados
            </span>
          </div>

          <div className="flex flex-col gap-1.5">
            {verifiedSources.map((source, idx) => (
              <a
                key={idx}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-center justify-between p-2 rounded-xl text-xs font-bold border transition-colors ${source.badgeColor}`}
                title={`Acessar: ${source.title}`}
              >
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  {source.type === 'tribunal' ? (
                    <Scale className="w-3.5 h-3.5 shrink-0 text-sky-700" />
                  ) : source.type === 'auditoria' ? (
                    <Search className="w-3.5 h-3.5 shrink-0 text-indigo-700" />
                  ) : (
                    <FileText className="w-3.5 h-3.5 shrink-0 text-emerald-700" />
                  )}
                  <span className="truncate">{source.title}</span>
                </div>
                <ArrowUpRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
              </a>
            ))}
          </div>
        </div>

        {/* Explicação Detalhada Expansível */}
        {expanded && (
          <div className="mt-3 pt-4 border-t border-slate-200 text-xs sm:text-sm text-slate-700 space-y-3 animate-fadeIn">
            <div>
              <h5 className="font-black text-slate-900 mb-1 flex items-center gap-1">
                <BookOpen className="w-4 h-4 text-slate-600" />
                <span>Dossiê da Checagem &amp; Fundamentação:</span>
              </h5>
              <p className="leading-relaxed text-slate-700 text-xs sm:text-sm bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                {factCheck.detailedExplanation}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs text-slate-500">
              <span className="font-medium">Tags: {factCheck.tags.join(', ')}</span>
              <span className="text-slate-400">Publicado originalmente por {factCheck.sourceAgency}</span>
            </div>
          </div>
        )}

      </div>

      {/* Barra de Ações Rápidas no Rodapé */}
      <div className="bg-slate-50/90 px-5 sm:px-6 py-3 border-t border-slate-200/80 flex items-center justify-between gap-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors"
        >
          <span>{expanded ? 'Ocultar dossiê detalhado' : 'Ver dossiê & fundamentação completa'}</span>
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <button
          onClick={handleShareWhatsApp}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold shadow-xs transition-all hover:scale-105 active:scale-95"
          title="Compartilhar no WhatsApp para desmentir boatos"
        >
          {copied ? <Check className="w-4 h-4 text-white" /> : <Share2 className="w-4 h-4 text-white" />}
          <span>{copied ? 'Copiado!' : 'Desmentir no WhatsApp'}</span>
        </button>
      </div>

    </article>
  );
}
