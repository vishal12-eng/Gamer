export const SEO_CONFIG = {
  siteName: 'FutureTechJournal',
  siteUrl: 'https://futuretechjournal50.netlify.app',
  defaultTitle: 'FutureTechJournal - AI-Powered Tech News & Innovation',
  defaultDescription: 'Your premier source for AI-powered news, technology insights, business updates, and cutting-edge tech journalism covering global innovation.',
  defaultKeywords: ['AI News', 'Technology', 'Future Tech', 'Business News', 'Artificial Intelligence', 'Tech Blog', 'Innovation', 'Science', 'Gadgets'],
  defaultImage: 'https://futuretechjournal50.netlify.app/og-image.png',
  logoUrl: 'https://futuretechjournal50.netlify.app/logo.png',
  twitterHandle: '@tech_futur32551',
  socialLinks: {
    twitter: 'https://twitter.com/tech_futur32551',
    linkedin: 'https://www.linkedin.com/in/future-tech-journal-354071392/'
  },
  contactEmail: 'futuretechjournal@gmail.com',
  locale: 'en_US',
  categories: ['Technology', 'AI', 'Business', 'Global', 'Product', 'Entertainment', 'Science', 'India', 'US']
};

export const buildCanonicalUrl = (path: string): string => {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SEO_CONFIG.siteUrl}${cleanPath}`;
};

export const buildArticleUrl = (slug: string): string => {
  return `${SEO_CONFIG.siteUrl}/article/${slug}`;
};

export const buildCategoryUrl = (category: string): string => {
  return `${SEO_CONFIG.siteUrl}/category/${category.toLowerCase()}`;
};

export const buildAuthorUrl = (authorName: string): string => {
  const slug = authorName.replace(/\s+/g, '-').toLowerCase();
  return `${SEO_CONFIG.siteUrl}/author/${slug}`;
};

export const getPageSEO = (pageType: string, data?: Record<string, string>) => {
  const pages: Record<string, { title: string; description: string; keywords: string[] }> = {
    home: {
      title: `${SEO_CONFIG.siteName} - The Future of AI, Technology, Business & Global News`,
      description: SEO_CONFIG.defaultDescription,
      keywords: SEO_CONFIG.defaultKeywords
    },
    about: {
      title: `About Us | ${SEO_CONFIG.siteName}`,
      description: `Learn about ${SEO_CONFIG.siteName}, an AI-powered news platform pioneering the future of technology journalism with cutting-edge content curation.`,
      keywords: ['About FutureTechJournal', 'AI Journalism', 'Tech News Platform', 'Innovation', 'Technology Media']
    },
    contact: {
      title: `Contact Us | ${SEO_CONFIG.siteName}`,
      description: `Get in touch with ${SEO_CONFIG.siteName}. Have a news tip, question, or collaboration idea? We'd love to hear from you.`,
      keywords: ['Contact FutureTechJournal', 'News Tips', 'Media Inquiries', 'Tech Journalism Contact']
    },
    foryou: {
      title: `For You - Personalized Recommendations | ${SEO_CONFIG.siteName}`,
      description: `Discover personalized article recommendations based on your reading history. AI-curated content tailored just for you.`,
      keywords: ['Personalized News', 'AI Recommendations', 'Custom Feed', 'Tech Articles For You']
    },
    bookmarks: {
      title: `My Bookmarks | ${SEO_CONFIG.siteName}`,
      description: `Your saved articles and bookmarks. Access your curated collection of technology and AI news stories anytime.`,
      keywords: ['Saved Articles', 'Bookmarks', 'Reading List', 'Tech News Collection']
    },
    search: {
      title: data?.query ? `Search: ${data.query} | ${SEO_CONFIG.siteName}` : `Search Articles | ${SEO_CONFIG.siteName}`,
      description: data?.query 
        ? `Search results for "${data.query}" on ${SEO_CONFIG.siteName}. Find relevant tech news and articles.`
        : `Search through our extensive library of AI, technology, business, and innovation articles.`,
      keywords: ['Search Articles', 'Find Tech News', 'Article Search', ...(data?.query ? [data.query] : [])]
    },
    privacy: {
      title: `Privacy Policy | ${SEO_CONFIG.siteName}`,
      description: `Read our privacy policy to understand how ${SEO_CONFIG.siteName} collects, uses, and protects your personal information.`,
      keywords: ['Privacy Policy', 'Data Protection', 'User Privacy', 'Cookie Policy']
    },
    terms: {
      title: `Terms & Conditions | ${SEO_CONFIG.siteName}`,
      description: `Review the terms and conditions for using ${SEO_CONFIG.siteName}. Understand your rights and responsibilities as a user.`,
      keywords: ['Terms of Service', 'User Agreement', 'Terms and Conditions', 'Legal Terms']
    },
    disclaimer: {
      title: `Disclaimer | ${SEO_CONFIG.siteName}`,
      description: `Important disclaimers about the content on ${SEO_CONFIG.siteName}, including AI-generated content and third-party sources.`,
      keywords: ['Disclaimer', 'Content Notice', 'AI Content Disclaimer', 'Legal Notice']
    },
    sitemap: {
      title: `Sitemap | ${SEO_CONFIG.siteName}`,
      description: `Navigate through all pages and categories on ${SEO_CONFIG.siteName}. Find articles on AI, technology, business, and more.`,
      keywords: ['Sitemap', 'Site Navigation', 'All Articles', 'Categories']
    },
    category: {
      title: data?.category ? `${data.category} News & Articles | ${SEO_CONFIG.siteName}` : `Category | ${SEO_CONFIG.siteName}`,
      description: data?.category 
        ? `Read the latest ${data.category} news and updates on ${SEO_CONFIG.siteName}. Curated articles powered by AI.`
        : `Browse articles by category on ${SEO_CONFIG.siteName}.`,
      keywords: data?.category 
        ? [data.category, `${data.category} News`, 'Tech News', SEO_CONFIG.siteName]
        : ['Categories', 'Tech News', SEO_CONFIG.siteName]
    }
  };

  return pages[pageType] || pages.home;
};

export const sanitizeDescription = (text: string, maxLength: number = 160): string => {
  if (!text) return SEO_CONFIG.defaultDescription;
  const cleaned = text
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/[\n\r]/g, ' ')
    .trim();
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength - 30 ? truncated.substring(0, lastSpace) : truncated) + '...';
};

export const sanitizeTitle = (title: string, maxLength: number = 60): string => {
  if (!title) return SEO_CONFIG.defaultTitle;
  const cleaned = title.replace(/<[^>]*>/g, '').trim();
  if (cleaned.length <= maxLength) return cleaned;
  const truncated = cleaned.substring(0, maxLength - 3);
  const lastSpace = truncated.lastIndexOf(' ');
  return (lastSpace > maxLength - 15 ? truncated.substring(0, lastSpace) : truncated) + '...';
};
