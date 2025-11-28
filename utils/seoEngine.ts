import { Article } from '../types';

export const generateSEOTitle = (title: string, siteSuffix: string = 'FutureTechJournal'): string => {
  const cleanTitle = title.replace(/<[^>]*>/g, '').trim();
  if (cleanTitle.length > 55) {
    return `${cleanTitle.substring(0, 55)}... | ${siteSuffix}`;
  }
  return `${cleanTitle} | ${siteSuffix}`;
};

export const generateMetaDescription = (htmlOrText: string): string => {
  const text = htmlOrText.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length > 155) {
    return text.substring(0, 155) + '...';
  }
  return text;
};

export const generateKeywords = (title: string, category: string, tags: string[]): string[] => {
  const baseKeywords = [category, 'Technology', 'Future Tech', 'AI News'];
  const titleWords = title.split(' ').filter(w => w.length > 4).slice(0, 3);
  const combined = Array.from(new Set([...baseKeywords, ...tags, ...titleWords]));
  return combined.slice(0, 12);
};

export const buildOpenGraph = (article: Article, domain: string) => {
  const url = `${domain}/article/${article.slug}`;
  const description = generateMetaDescription(article.summary || article.content);
  return {
    title: article.title,
    description: description,
    image: article.imageUrl || `${domain}/logo.png`,
    url: url,
    type: 'article',
    site_name: 'FutureTechJournal',
    published_time: article.date,
    modified_time: article.date, // In a real app, this would be lastModified
    author: article.author,
    section: article.category,
    tag: article.tags
  };
};

export const buildTwitterCard = (article: Article, domain: string) => {
  return {
    card: 'summary_large_image',
    site: '@tech_futur32551',
    creator: '@tech_futur32551',
    title: article.title,
    description: generateMetaDescription(article.summary || article.content),
    image: article.imageUrl || `${domain}/logo.png`
  };
};

export const buildArticleSchema = (article: Article, domain: string) => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title.substring(0, 110),
    "image": [article.imageUrl],
    "datePublished": article.date,
    "dateModified": article.date,
    "description": generateMetaDescription(article.summary || article.content),
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `${domain}/author/${article.author.replace(/\s+/g, '-').toLowerCase()}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "FutureTechJournal",
      "logo": {
        "@type": "ImageObject",
        "url": `${domain}/logo.png`
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${domain}/article/${article.slug}`
    },
    "articleSection": article.category,
    "keywords": article.tags.join(", ")
  };
};

export const buildBreadcrumbSchema = (items: { name: string; url: string }[]) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };
};
