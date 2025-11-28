import { Article } from '../types';

export const generateWebsiteSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "FutureTechJournal",
    "url": "https://futuretechjournal50.netlify.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://futuretechjournal50.netlify.app/search?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };
};

export const generateOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsMediaOrganization",
    "name": "FutureTechJournal",
    "url": "https://futuretechjournal50.netlify.app",
    "logo": {
      "@type": "ImageObject",
      "url": "https://futuretechjournal50.netlify.app/logo.png", // Assuming a logo exists or using a placeholder
      "width": 600,
      "height": 60
    },
    "sameAs": [
      "https://twitter.com/tech_futur32551",
      "https://www.linkedin.com/in/future-tech-journal-354071392/"
    ]
  };
};

export const generateNewsArticleSchema = (article: Article) => {
  return {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    "headline": article.title,
    "description": article.summary,
    "image": [article.imageUrl],
    "datePublished": article.date,
    "dateModified": article.date,
    "author": {
      "@type": "Person",
      "name": article.author,
      "url": `https://futuretechjournal50.netlify.app/author/${article.author.replace(/\s+/g, '-').toLowerCase()}`
    },
    "publisher": {
      "@type": "Organization",
      "name": "FutureTechJournal",
      "logo": {
        "@type": "ImageObject",
        "url": "https://futuretechjournal50.netlify.app/logo.png"
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://futuretechjournal50.netlify.app/article/${article.slug}`
    },
    "articleSection": article.category,
    "keywords": article.tags.join(", ")
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
