import { Article } from '../types';
import { SEO_CONFIG, buildCanonicalUrl, buildArticleUrl, buildAuthorUrl, sanitizeDescription } from './seoConfig';

export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "description": SEO_CONFIG.defaultDescription,
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": `${SEO_CONFIG.siteUrl}/search?q={search_term_string}`
      },
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": SEO_CONFIG.siteName,
    "url": SEO_CONFIG.siteUrl,
    "logo": {
      "@type": "ImageObject",
      "url": SEO_CONFIG.logoUrl,
      "width": 600,
      "height": 60
    },
    "sameAs": [
      SEO_CONFIG.socialLinks.twitter,
      SEO_CONFIG.socialLinks.linkedin
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": SEO_CONFIG.contactEmail
    }
  };
};

export const generateNewsArticleSchema = (article: Article) => {
  const articleUrl = buildArticleUrl(article.slug);
  const authorUrl = buildAuthorUrl(article.author);
  const description = sanitizeDescription(article.summary || article.content, 200);
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title.substring(0, 110),
    "description": description,
    "image": article.imageUrl ? [article.imageUrl] : [SEO_CONFIG.defaultImage],
    "datePublished": article.date,
    "dateModified": article.lastModified || article.date,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": authorUrl
    },
    "publisher": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": SEO_CONFIG.logoUrl
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": articleUrl
    },
    "articleSection": article.category,
    "keywords": article.tags?.join(', ') || article.category,
    "isAccessibleForFree": true,
    "inLanguage": "en-US"
  };
};

export const generateBreadcrumbSchema = (items: { name: string; item: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.item
    }))
  };
};

export const generateCollectionPageSchema = (
  categoryName: string, 
  articles: Article[],
  categoryUrl: string
) => {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": `${categoryName} News & Articles`,
    "description": `Latest ${categoryName} news and articles from ${SEO_CONFIG.siteName}`,
    "url": categoryUrl,
    "isPartOf": {
      "@type": "WebSite",
      "name": SEO_CONFIG.siteName,
      "url": SEO_CONFIG.siteUrl
    },
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": articles.length,
      "itemListElement": articles.slice(0, 10).map((article, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "url": buildArticleUrl(article.slug),
        "name": article.title
      }))
    }
  };
};

export const generateFAQSchema = (questions: { question: string; answer: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": questions.map(q => ({
      "@type": "Question",
      "name": q.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": q.answer
      }
    }))
  };
};

export const generateAboutPageSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    "name": `About ${SEO_CONFIG.siteName}`,
    "description": `Learn about ${SEO_CONFIG.siteName}, an AI-powered news platform pioneering the future of technology journalism.`,
    "url": buildCanonicalUrl('/about'),
    "mainEntity": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName,
      "description": SEO_CONFIG.defaultDescription,
      "url": SEO_CONFIG.siteUrl,
      "logo": SEO_CONFIG.logoUrl
    }
  };
};

export const generateContactPageSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "name": `Contact ${SEO_CONFIG.siteName}`,
    "description": `Get in touch with ${SEO_CONFIG.siteName}. Have a news tip, question, or collaboration idea?`,
    "url": buildCanonicalUrl('/contact'),
    "mainEntity": {
      "@type": "Organization",
      "name": SEO_CONFIG.siteName,
      "email": SEO_CONFIG.contactEmail,
      "url": SEO_CONFIG.siteUrl
    }
  };
};
