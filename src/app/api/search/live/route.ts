import { NextRequest, NextResponse } from 'next/server';
import { executeSmartSearch, normalizeText } from '@/lib/searchEngine';
import { INITIAL_FACT_CHECKS } from '@/data/factChecks';
import { INITIAL_JUDICIAL_PROCESSES } from '@/data/judicialProcesses';
import { INITIAL_POLITICIANS } from '@/data/politicians';
import { INITIAL_POLLS } from '@/data/polls';
import { FactCheck, VerdictType } from '@/types';

// Descodificador simples de entidades HTML
function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/<!\[CDATA\[(.*?)\]\]>/gi, '$1')
    .trim();
}

// Infere veredito com base no título e texto da notícia ou checagem
function inferVerdictFromText(text: string): VerdictType {
  const norm = normalizeText(text);
  if (
    norm.includes('falso') ||
    norm.includes('fake') ||
    norm.includes('mentira') ||
    norm.includes('nao e verdade') ||
    norm.includes('desment') ||
    norm.includes('golpe') ||
    norm.includes('adulterad') ||
    norm.includes('boato') ||
    norm.includes('distorce')
  ) {
    return 'FAKE';
  }
  if (
    norm.includes('fato') ||
    norm.includes('verdadeiro') ||
    norm.includes('verdade') ||
    norm.includes('comprovad') ||
    norm.includes('confirma') ||
    norm.includes('e real')
  ) {
    return 'FATO';
  }
  return 'ENGANOSO';
}

function resolvePoliticianForNews(query: string, title: string) {
  const text = `${query} ${title}`.toLowerCase();

  // 1. Temas vinculados a Flávio Bolsonaro (INSS, Careca do INSS, Rachadinha, Queiroz, Master)
  if (
    text.includes('inss') ||
    text.includes('careca do inss') ||
    text.includes('previdencia') ||
    text.includes('rachadinha') ||
    text.includes('queiroz') ||
    text.includes('flavio') ||
    text.includes('banco master')
  ) {
    const flavio = INITIAL_POLITICIANS.find(p => p.id === 'flavio-bolsonaro');
    if (flavio) {
      return {
        id: flavio.id,
        name: flavio.name,
        role: flavio.role,
        state: flavio.state,
        party: flavio.party,
        photoUrl: flavio.photoUrl,
      };
    }
  }

  // 2. Temas vinculados a Lula
  if (text.includes('lula') || text.includes('luiz inacio')) {
    const lula = INITIAL_POLITICIANS.find(p => p.id === 'lula');
    if (lula) {
      return {
        id: lula.id,
        name: lula.name,
        role: lula.role,
        state: lula.state,
        party: lula.party,
        photoUrl: lula.photoUrl,
      };
    }
  }

  // 3. Temas vinculados a Jair Bolsonaro
  if (text.includes('jair bolsonaro') || (text.includes('bolsonaro') && !text.includes('flavio'))) {
    const jair = INITIAL_POLITICIANS.find(p => p.id === 'jair-bolsonaro');
    if (jair) {
      return {
        id: jair.id,
        name: jair.name,
        role: jair.role,
        state: jair.state,
        party: jair.party,
        photoUrl: jair.photoUrl,
      };
    }
  }

  // 4. Temas vinculados a Tarcísio de Freitas
  if (text.includes('tarcisio') || text.includes('sabesp')) {
    const tarcisio = INITIAL_POLITICIANS.find(p => p.id === 'tarcisio-de-freitas');
    if (tarcisio) {
      return {
        id: tarcisio.id,
        name: tarcisio.name,
        role: tarcisio.role,
        state: tarcisio.state,
        party: tarcisio.party,
        photoUrl: tarcisio.photoUrl,
      };
    }
  }

  return {
    id: 'tema-aberto',
    name: 'Tema / Notícia Aberta',
    role: 'Deputado Federal' as any,
    state: 'BR',
    party: 'Imprensa Aberta',
    photoUrl: '/images/politicians/branco-nulo.svg',
  };
}

// 1. Busca ao vivo via Google Fact Check Tools API (pública/gratuita)
async function fetchGoogleFactCheckAPI(query: string): Promise<FactCheck[]> {
  const apiKey = process.env.GOOGLE_FACTCHECK_API_KEY || '';
  const keyParam = apiKey ? `&key=${apiKey}` : '';
  const url = `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(query)}&languageCode=pt-BR${keyParam}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'FatosFakesCivic/1.0' },
      next: { revalidate: 300 }, // cache 5 min
    });

    if (!res.ok) return [];

    const data = await res.json();
    if (!data.claims || !Array.isArray(data.claims)) return [];

    const results: FactCheck[] = [];

    for (let i = 0; i < data.claims.length; i++) {
      const claim = data.claims[i];
      const review = claim.claimReview?.[0];
      if (!review) continue;

      const title = decodeHtmlEntities(claim.text || review.title || 'Checagem de alegação');
      const rating = review.textualRating || '';
      const verdict = inferVerdictFromText(`${rating} ${title}`);
      const agency = review.publisher?.name || 'Agência de Checagem';
      const sourceUrl = review.url || '';
      const politicianData = resolvePoliticianForNews(query, title);

      results.push({
        id: `live-gfact-${i}-${Date.now()}`,
        title,
        verdict,
        politician: politicianData,
        summary: `Alegação verificada por ${agency}: "${rating}".`,
        detailedExplanation: `Investigação conduzida pela agência ${agency}. Conclusão: ${rating}. Acesse o artigo original completo na fonte indicada.`,
        viralClaim: claim.text || title,
        sourceAgency: agency,
        sourceUrl,
        publishedAt: review.reviewDate || new Date().toISOString(),
        category: 'Declarações',
        tags: ['Checagem ao Vivo', 'Web Aberta', agency],
        isLiveResult: true,
      });
    }

    return results;
  } catch {
    return [];
  }
}

// 2. Busca ao vivo via Google News RSS (100% gratuita, sem chaves, sem limites)
async function fetchGoogleNewsRSS(query: string): Promise<FactCheck[]> {
  const rssQuery = `${query} (fato ou fake OR checagem OR mentira OR desmentido OR boato)`;
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(rssQuery)}&hl=pt-BR&gl=BR&ceid=BR:pt-419`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FatosFakesCivicBot/1.0; +https://fatosfakes.br)',
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const xml = await res.text();
    const itemMatches = xml.match(/<item>([\s\S]*?)<\/item>/gi) || [];
    const results: FactCheck[] = [];

    for (let i = 0; i < Math.min(itemMatches.length, 8); i++) {
      const itemXml = itemMatches[i];

      const rawTitle = (itemXml.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '').trim();
      const rawLink = (itemXml.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '').trim();
      const rawPubDate = (itemXml.match(/<pubDate>([\s\S]*?)<\/pubDate>/i)?.[1] || '').trim();
      const rawSource = (itemXml.match(/<source[^>]*>([\s\S]*?)<\/source>/i)?.[1] || 'Imprensa Oficial').trim();

      if (!rawTitle || !rawLink) continue;

      const title = decodeHtmlEntities(rawTitle.replace(/\s*-\s*[^-]+$/, '')); // remove sufixo da fonte
      const agency = decodeHtmlEntities(rawSource);
      const verdict = inferVerdictFromText(title);
      const politicianData = resolvePoliticianForNews(query, title);

      results.push({
        id: `live-rss-${i}-${Date.now()}`,
        title,
        verdict,
        politician: politicianData,
        summary: `Notícia de checagem apurada em tempo real por ${agency}.`,
        detailedExplanation: `Publicação recente identificada nos sistemas de monitoramento jornalístico. Consulte o portal ${agency} para íntegra dos documentos e depoimentos.`,
        viralClaim: title,
        sourceAgency: agency,
        sourceUrl: rawLink,
        publishedAt: rawPubDate ? new Date(rawPubDate).toISOString() : new Date().toISOString(),
        category: 'Declarações',
        tags: ['Notícia ao Vivo', 'Web Aberta', agency],
        isLiveResult: true,
      });
    }

    return results;
  } catch {
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';

  if (!query.trim() || query.trim().length < 2) {
    return NextResponse.json({
      parsedQuery: {
        rawQuery: query,
        topicKeywords: [],
        semanticIntentSummary: 'Digite um termo para pesquisar',
      },
      factChecks: [],
      processes: [],
      politicians: [],
      candidates: [],
      totalCount: 0,
      isLive: true,
      liveCount: 0,
    });
  }

  // 1. Executa a busca estruturada inteligente em nossa base local profunda
  const localResult = executeSmartSearch(
    query,
    INITIAL_FACT_CHECKS,
    INITIAL_JUDICIAL_PROCESSES,
    INITIAL_POLITICIANS,
    INITIAL_POLLS
  );

  // 2. Consulta fontes online ao vivo em paralelo (com timeout seguro de 4s para não travar a UI)
  let liveFactChecks: FactCheck[] = [];

  try {
    const livePromise = Promise.allSettled([
      fetchGoogleFactCheckAPI(query),
      fetchGoogleNewsRSS(query),
    ]);

    const timeoutPromise = new Promise<'timeout'>(resolve => 
      setTimeout(() => resolve('timeout'), 4000)
    );

    const raceResult = await Promise.race([livePromise, timeoutPromise]);

    if (raceResult !== 'timeout') {
      const [gfactRes, rssRes] = raceResult;
      const gfactItems = gfactRes.status === 'fulfilled' ? gfactRes.value : [];
      const rssItems = rssRes.status === 'fulfilled' ? rssRes.value : [];

      const combinedLive = [...gfactItems, ...rssItems];

      // Deduplicação: ignora itens cujo título ou URL já estejam presentes na base local
      const existingTitles = new Set(INITIAL_FACT_CHECKS.map(f => normalizeText(f.title)));
      const seenLiveTitles = new Set<string>();

      for (const item of combinedLive) {
        const norm = normalizeText(item.title);
        if (!existingTitles.has(norm) && !seenLiveTitles.has(norm)) {
          seenLiveTitles.add(norm);
          liveFactChecks.push(item);
        }
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar APIs ao vivo:', err);
  }

  // 3. Mescla os resultados locais ponderados com as checagens online
  const formattedLiveChecks = liveFactChecks.map(item => ({
    item,
    score: 35, // Score inicial de relevância para itens recém-pesquisados
  }));

  const allFactChecks = [...localResult.factChecks, ...formattedLiveChecks];

  return NextResponse.json({
    parsedQuery: localResult.parsedQuery,
    factChecks: allFactChecks,
    processes: localResult.processes,
    politicians: localResult.politicians,
    candidates: localResult.candidates,
    totalCount: allFactChecks.length + localResult.processes.length + localResult.politicians.length + localResult.candidates.length,
    isLive: true,
    liveCount: liveFactChecks.length,
  });
}
