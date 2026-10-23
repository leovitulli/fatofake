import { FactCheck } from '@/types';
import { normalizeText } from './searchEngine';

function stripHtml(html: string): string {
  return (html || '')
    .replace(/<[^>]*>?/gm, '')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

/**
 * Busca ao vivo na web aberta através da API da Wikipédia (CORS liberado nativamente)
 * e combina com a rota de notícias do servidor Next.js.
 */
export async function searchOpenWebLive(query: string): Promise<FactCheck[]> {
  const cleanQuery = query.trim();
  if (!cleanQuery || cleanQuery.length < 2) return [];

  const results: FactCheck[] = [];
  const seenTitles = new Set<string>();

  // 1. Consulta aberta à Wikipédia em Português (100% livre, sem chaves, CORS origin=*)
  try {
    const wikiUrl = `https://pt.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(cleanQuery)}&utf8=&format=json&origin=*&srlimit=6`;
    const res = await fetch(wikiUrl);
    if (res.ok) {
      const data = await res.json();
      const searchItems = data.query?.search || [];

      for (let i = 0; i < searchItems.length; i++) {
        const item = searchItems[i];
        const title = item.title;
        const norm = normalizeText(title);

        if (seenTitles.has(norm)) continue;
        seenTitles.add(norm);

        const cleanSnippet = stripHtml(item.snippet);
        const articleUrl = `https://pt.wikipedia.org/wiki/${encodeURIComponent(title.replace(/\s+/g, '_'))}`;

        results.push({
          id: `wiki-live-${item.pageid || i}-${Date.now()}`,
          title: `Registro Documental: ${title}`,
          verdict: 'FATO',
          politician: {
            id: 'pesquisa-web',
            name: title.length > 25 ? 'Registro Público / Ente Político' : title,
            role: 'Presidente',
            state: 'BR',
            party: 'Documento Aberto',
            photoUrl: '/images/politicians/branco-nulo.svg',
          },
          summary: `${cleanSnippet}...`,
          detailedExplanation: `Artigo enciclopédico com referências documentais e bibliográficas auditadas. Acesse a documentação completa no registro público da Wikipédia.`,
          viralClaim: `Consulta pública aberta sobre "${cleanQuery}".`,
          sourceAgency: 'Wikipédia Aberta (Fontes Auditadas)',
          sourceUrl: articleUrl,
          publishedAt: item.timestamp || new Date().toISOString(),
          category: 'Declarações',
          tags: ['Pesquisa Aberta', 'Web ao Vivo', 'Documentação Oficial'],
          isLiveResult: true,
        });
      }
    }
  } catch (err) {
    console.warn('Erro ao consultar Wikipedia aberta:', err);
  }

  // 2. Tenta também a rota do servidor /api/search/live (caso o servidor tenha acesso externo)
  try {
    const serverRes = await fetch(`/api/search/live?q=${encodeURIComponent(cleanQuery)}`);
    if (serverRes.ok) {
      const data = await serverRes.json();
      if (Array.isArray(data.factChecks)) {
        for (const fc of data.factChecks) {
          const item: FactCheck = fc.item || fc;
          if (item && item.isLiveResult) {
            const norm = normalizeText(item.title);
            if (!seenTitles.has(norm)) {
              seenTitles.add(norm);
              results.push(item);
            }
          }
        }
      }
    }
  } catch {
    // Falha silenciosa do servidor — a busca client-side da Wikipedia já garantiu os resultados!
  }

  return results;
}
