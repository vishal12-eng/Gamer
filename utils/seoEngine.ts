import { Article } from '../types';
import { SEO_CONFIG, buildArticleUrl, buildAuthorUrl, buildCategoryUrl, sanitizeDescription, sanitizeTitle } from './seoConfig';

export const generateSEOTitle = (title: string, includesSuffix: boolean = true): string => {
  const cleanTitle = sanitizeTitle(title, 55);
  if (!includesSuffix) return cleanTitle;
  if (cleanTitle.includes(SEO_CONFIG.siteName)) return cleanTitle;
  return `${cleanTitle} | ${SEO_CONFIG.siteName}`;
};

export const generateMetaDescription = (htmlOrText: string, maxLength: number = 160): string => {
  return sanitizeDescription(htmlOrText, maxLength);
};

export const generateKeywords = (title: string, category: string, tags: string[] = []): string[] => {
  const baseKeywords = [category, 'Technology', 'Future Tech', 'AI News', SEO_CONFIG.siteName];
  const titleWords = title
    .replace(/<[^>]*>/g, '')
    .split(/\s+/)
    .filter(w => w.length > 4 && !w.match(/^(the|and|for|with|from|that|this|have|been|were|will)$/i))
    .slice(0, 5);
  const combined = Array.from(new Set([...baseKeywords, ...tags, ...titleWords]));
  return combined.slice(0, 15);
};

export const buildOpenGraph = (article: Article) => {
  const url = buildArticleUrl(article.slug);
  const description = generateMetaDescription(article.summary || article.content);
  return {
    title: article.title,
    description: description,
    image: article.imageUrl || SEO_CONFIG.defaultImage,
    url: url,
    type: 'article' as const,
    site_name: SEO_CONFIG.siteName,
    published_time: article.date,
    modified_time: article.lastModified || article.date,
    author: article.author,
    section: article.category,
    tag: article.tags
  };
};

export const buildTwitterCard = (article: Article) => {
  return {
    card: 'summary_large_image' as const,
    site: SEO_CONFIG.twitterHandle,
    creator: SEO_CONFIG.twitterHandle,
    title: article.title,
    description: generateMetaDescription(article.summary || article.content),
    image: article.imageUrl || SEO_CONFIG.defaultImage
  };
};

export const buildArticleSchema = (article: Article, domain?: string) => {
  const baseUrl = domain || SEO_CONFIG.siteUrl;
  const articleUrl = `${baseUrl}/article/${article.slug}`;
  const authorUrl = buildAuthorUrl(article.author);
  
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title.substring(0, 110),
    "image": article.imageUrl ? [article.imageUrl] : [SEO_CONFIG.defaultImage],
    "datePublished": article.date,
    "dateModified": article.lastModified || article.date,
    "description": generateMetaDescription(article.summary || article.content, 200),
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

export const buildCategoryBreadcrumb = (categoryName: string) => {
  return buildBreadcrumbSchema([
    { name: 'Home', url: SEO_CONFIG.siteUrl },
    { name: categoryName, url: buildCategoryUrl(categoryName) }
  ]);
};

export const buildArticleBreadcrumb = (article: Article) => {
  return buildBreadcrumbSchema([
    { name: 'Home', url: SEO_CONFIG.siteUrl },
    { name: article.category, url: buildCategoryUrl(article.category) },
    { name: article.title, url: buildArticleUrl(article.slug) }
  ]);
};
