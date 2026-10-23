# 🏛️ Plano Mestre Unificado: Plataforma FATOS & FAKES
> **Documento Estratégico de Implementação em Passo Único**  
> *Consolidação das Decisões de Arquitetura, Busca Online Gratuita, Links Virais Reais e Imparcialidade Absoluta.*

---

## 🎯 1. Visão Geral & Princípios Inegociáveis

A plataforma **FATOS & FAKES** tem como objetivo ser um motor de busca cívico, investigativo e jornalístico de utilidade pública. 

### Princípios Fundamentais:
1. **Busca Viva e Aberta (Sem Engessamento)**: O sistema não se limita a registros pré-cadastrados. Quando o usuário digita qualquer político, escândalo, processo ou boato, a plataforma pesquisa a internet e as bases de checagem em tempo real.
2. **Imparcialidade Absoluta e Rigor Documental**: Sem viés ou preferência político-partidária. Aplica-se a mesma régua investigativa para esquerda, centro e direita. Todas as apurações devem distinguir:
   * **O Fato Apurado**: O que foi documentado pelas autoridades ou imprensa.
   * **O Status Judiciário Real**: Se houve condenação, inquérito em trâmite, denúncia arquivada ou provas anuladas sem análise de mérito (ex: STJ/STF no caso da Alerj).
   * **A Posição da Defesa**: Manifestação oficial obrigatória da assessoria jurídica do político.
3. **Links Verídicos de Ponta a Ponta**:
   * O link ou arquivo do **vídeo/post viral original** (TikTok, Instagram Reels, X/Twitter, YouTube).
   * O link da **reportagem investigativa** da agência de checagem (*Lupa, Aos Fatos, G1, Estadão, UOL*).
   * O link dos **documentos oficiais e tribunais** (*Diário Oficial da União, STF, STJ, TSE, Coaf, Alerj*).
4. **Arquitetura 100% Gratuita**: Utilização de APIs e protocolos abertos sem custos de assinatura, cartões de crédito ou cobranças por consulta.

---

## 🌐 2. Arquitetura da Busca Online em Tempo Real (100% Gratuita)

O fluxo funcionará através de um endpoint backend no Next.js (`/api/search/live`):

```
                        [ Usuário digita na barra de busca ]
                                          │
                                          ▼
                         [ /api/search/live (Next.js) ]
                ┌─────────────────────────┼─────────────────────────┐
                ▼                         ▼                         ▼
   [ Google Fact Check API ]     [ Google News Search RSS ]   [ Dossiês e Autos ]
    - 100% Gratuita               - 100% Gratuita              - Base documentada
    - Indexa Lupa, Aos Fatos,     - Sem chave de API           - Crimeta Russa (28 casos)
      G1, Estadão, UOL, etc.      - Notícias e apurações       - Bolsomaster
    - Padrão ClaimReview            em tempo real              - STF / STJ / TSE
                └─────────────────────────┬─────────────────────────┘
                                          ▼
                       [ Extrator de Evidências e Links ]
                        - URL do vídeo viral (TikTok/Insta/X)
                        - URL da matéria da checagem
                        - URL do documento do tribunal/DOU
                                          ▼
                        [ Resposta Dinâmica na Tela ]
```

### Fontes Gratuitas Integradas:
1. **Google Fact Check Tools API**:
   * API pública do Google sem cobrança que agrega todas as organizações signatárias do *International Fact-Checking Network (IFCN)*.
   * Retorna alegações, autores, data da checagem, veredito original e URLs das reportagens.
2. **Google News RSS Feeds**:
   * Endpoint gratuito de alta velocidade para buscar notícias quentes de jornais de referência (*Folha, Valor Econômico, G1, UOL, Estadão, CNN*) sobre inquéritos ou casos recentes que ainda estão sob apuração.
3. **Extrator de Links Virais e Evidências**:
   * Mecanismo que varre a checagem para resgatar os links originais dos vídeos do TikTok, Reels do Instagram, publicações no X/Twitter ou seus registros de arquivamento no *Wayback Machine / Perma.cc*.
4. **Dossiês Investigativos Locais Integrados**:
   * O acervo de 28 casos catalogados de Flávio Bolsonaro (Rachadinha, 48 depósitos, Queiroz em Atibaia, Kopenhagen, 51 imóveis em dinheiro vivo, Banco Master / Dark Horse, etc.) fica permanentemente disponível como acervo de consulta rápida e cruzada.

---

## 📱 3. Novo Design dos Cards de Resultado com Links Reais

Cada resultado retornado pela busca ao vivo exibirá 3 níveis de comprovação:

```
┌────────────────────────────────────────────────────────────────────────┐
│ [ FAKE ]  Reforma Tributária aumentou imposto sobre carnes para 40%    │
│ 👤 Alvo: Luiz Inácio Lula da Silva · Economia                          │
├────────────────────────────────────────────────────────────────────────┤
│ 💬 O que viralizou:                                                   │
│ "Vídeo curto afirmando que a carne bovina teria imposto federal de 40%" │
│                                                                        │
│ 🎯 O que é verdade:                                                    │
│ A Lei Complementar da Reforma Tributária fixou alíquota ZERO para      │
│ carnes de consumo popular na Cesta Básica Nacional.                    │
├────────────────────────────────────────────────────────────────────────┤
│ 🔗 EVIDÊNCIAS E COMPROVAÇÃO:                                           │
│  🔴 Post Viral Original: [Assistir ao vídeo no TikTok / Instagram ↗]   │
│  🟢 Checagem Completa:   [Ler apuração no G1 Fato ou Fake ↗]           │
│  📄 Prova Documental:    [Consultar Lei no Diário Oficial da União ↗]  │
├────────────────────────────────────────────────────────────────────────┤
│ ⚖️ Posição da Defesa / Fonte Oficial:                                  │
│ Ministério da Fazenda divulgou nota confirmando a isenção de tributos. │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 🏛️ 4. Candidaturas 2026 & Filtro por Cargo Pretendido (Presidência da República)

### Problema Identificado:
Atualmente, figuras políticas que ocupam um cargo institucional (como Flávio Bolsonaro, que é Senador pelo RJ) mas que estão em plena articulação ou concorrendo como **candidatos à Presidência da República em 2026**, não apareciam ao clicar no filtro **"Presidente"**.

### Solução no Modelo e Interface:
1. **Filtro Inteligente de Cargo Atual vs. Candidatura 2026**:
   * O modelo de dados suportará `role` (cargo atual) e `candidateFor` (cargo disputado em 2026).
   * Ao filtrar por **"Presidente"**, a plataforma exibirá tanto o atual mandatário quanto todos os candidatos e pré-candidatos à Presidência da República:
     * **Luiz Inácio Lula da Silva** (PT - Presidente / Candidato à reeleição)
     * **Flávio Bolsonaro** (PL - Senador e pré-candidato do PL à Presidência 2026)
     * **Tarcísio de Freitas** (Republicanos - Governador de SP / cotado)
     * **Romeu Zema** (NOVO - Governador de MG / pré-candidato)
     * **Ronaldo Caiado** (União Brasil - Governador de GO / pré-candidato)
     * **Eduardo Leite** (PSDB - Governador do RS / cotado)
     * **Jair Bolsonaro** (PL - ex-Presidente, inelegível pelo TSE, figura central da oposição)
2. **Cédula Oficial na Pesquisa Eleitoral Presidencial 2026**:
   * Inclusão de Flávio Bolsonaro como candidato selecionável na enquete auditável da Presidência da República 2026, com número partidário, foto oficial do Senado e resumo de sua situação jurídica.
3. **Padrão Factual Neutro**:
   * O sistema não classifica subjetivamente fatos como "positivos" ou "negativos" para evitar viés; apenas atesta se a afirmação é **Verdadeira (Fato)**, **Falsa (Fake)** ou **Enganosa**, permitindo que o próprio eleitor tire suas conclusões.

---

## 🗂️ 5. Casos Documentados Já Mapeados (Dossiês Crimeta Russa & Bolsomaster)

Para pesquisas sobre Flávio Bolsonaro, Jair Bolsonaro e operações financeiras, o sistema traz a apuração completa das 28 frentes com seus respectivos links oficiais e judiciais:

1. **A Rachadinha Alerj / Queiroz**: Desvio de R$ 6,1 milhões apurado pelo MPRJ. Status: denúncia criminal rejeitada em 16/05/2022 por anulação de provas no STJ/STF (sem julgamento de mérito).
2. **Os 48 Depósitos de R$ 2 mil**: R$ 96 mil em espécie no caixa eletrônico da Alerj em 5 dias apontados pelo Coaf.
3. **Funcionários Fantasmas da Alerj**: Ação civil pública de improbidade administrativa mantida no STF pelo Min. Gilmar Mendes em 2026.
4. **Loja de Chocolates Kopenhagen**: 1.512 depósitos em dinheiro vivo (R$ 1,6 milhão) apontados na denúncia do MPRJ.
5. **51 Imóveis em Dinheiro Vivo**: Levantamento de 7 meses do UOL em cartórios registrando compras em moeda corrente pela família Bolsonaro.
6. **Queiroz em Atibaia**: Prisão do operador financeiro no imóvel do advogado Frederick Wassef pela Operação Anjo.
7. **Capitão Adriano da Nóbrega**: Medalha Tiradentes entregue na prisão em 2005 e nomeação de familiares no gabinete da Alerj.
8. **Dark Horse & Banco Master**: Aporte de mais de R$ 61 milhões via fundo Havengate (EUA) para filme sobre Jair Bolsonaro, investigado pela PF no STF.
9. **Usuário Master / Offshore Alcazar**: Nome de Flávio cadastrado com acesso master em contas do advogado Willer Tomaz sob inquérito no STF.
10. **Financiamento BRB / Mansão no Lago Sul**: Imóvel de R$ 5,97 milhões com financiamento de R$ 3,1 milhões a juros de 3,71% a.a. quitado em 3 anos.
11. **Abin Paralela**: Relatório da PF no STF apontando uso da estrutura da agência para abastecer a defesa de Flávio.
12. **Caso Richarlison**: Disputa possessória de mansão de R$ 10 milhões em Angra dos Reis levada à Polícia Federal.

---

## 🚀 5. Roteiro de Implementação em Atualização Única

Assim que este plano for aprovado, executaremos as alterações de uma só vez:

1. **Backend (`/api/search/live/route.ts`)**:
   - Criação da rota Next.js com consulta paralela à **Google Fact Check API** e aos feeds do **Google News RSS**.
   - Normalização automática das respostas com identificação de links virais, reportagens e fontes oficiais.
2. **Atualização do Modelo de Dados (`src/types/index.ts`)**:
   - Inclusão dos campos de links de vídeos/posts virais (`viralPostUrls`), matérias de checagem (`factCheckSource`) e documentos comprobatórios (`officialProofUrl`).
3. **Conexão com a Interface (`src/app/page.tsx` & `src/components/SmartSearchResultsView.tsx`)**:
   - A barra de busca dispara a consulta ao vivo via `fetch('/api/search/live?q=...')` com debounce.
   - Estado visual de carregamento dinâmico (*"Pesquisando bases de checagem e notícias em tempo real..."*).
   - Renderização dos cards com os botões clicáveis para o vídeo do TikTok/Instagram, a checagem e o tribunal.
4. **Validação Final**:
   - Teste de busca com múltiplos nomes e termos: Flávio Bolsonaro, Lula, Banco Master, Tarcísio, Nikolas, e termos gerais.
   - Checagem de TypeScript (`tsc --noEmit`), garantindo 0 erros.

---
