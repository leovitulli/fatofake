import { FactCheck } from '@/types';

interface ClaimReviewSchemaProps {
  factCheck: FactCheck;
}

export function ClaimReviewSchema({ factCheck }: ClaimReviewSchemaProps) {
  const getRatingValue = (verdict: string) => {
    switch (verdict) {
      case 'FATO': return 5;
      case 'ENGANOSO': return 2;
      case 'EXAGERADO': return 3;
      case 'FAKE': default: return 1;
    }
  };

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'ClaimReview',
    datePublished: factCheck.publishedAt,
    url: typeof window !== 'undefined' ? window.location.href : `https://fatosfakes.com.br/#check-${factCheck.id}`,
    claimReviewed: factCheck.title,
    itemReviewed: {
      '@type': 'Claim',
      author: {
        '@type': 'Person',
        name: factCheck.politician.name,
        jobTitle: factCheck.politician.role,
      },
      datePublished: factCheck.publishedAt,
      appearance: {
        '@type': 'CreativeWork',
        description: factCheck.viralClaim,
      }
    },
    author: {
      '@type': 'Organization',
      name: 'FATOS & FAKES - Central Cívica de Checagem',
      url: 'https://fatosfakes.com.br',
    },
    reviewRating: {
      '@type': 'Rating',
      ratingValue: getRatingValue(factCheck.verdict),
      bestRating: 5,
      worstRating: 1,
      alternateName: factCheck.verdict,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
    />
  );
}
