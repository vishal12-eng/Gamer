import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Article, Category } from '../types';
import { mockArticles } from '../pages/data/mockData';

const RSS2JSON_API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';
const API_BASE = '/api';
const REFRESH_INTERVAL = 30 * 60 * 1000;

interface ArticleContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  isDbConnected: boolean;
  updateArticle: (slug: string, updatedData: Partial<Article>) => Promise<void>;
  refreshArticles: () => Promise<void>;
  getArticleBySlug: (slug: string) => Article | undefined;
  getArticlesByCategory: (category: Category) => Article[];
}

const ArticleContext = createContext<ArticleContextType | undefined>(undefined);

interface Rss2JsonItem {
  title: string;
  pubDate: string;
  link: string;
  guid: string;
  author: string;
  thumbnail: string;
  description: string;
  content: string;
  enclosure: {
    link?: string;
    type?: string;
  };
  categories: string[];
}

const feedMap: Partial<Record<Category, string[]>> = {
  Global: [
    'https://www.aljazeera.com/xml/rss/all.xml',
    'http://feeds.bbci.co.uk/news/world/rss.xml'
  ],
  Entertainment: [
    'https://www.hindustantimes.com/feeds/rss/entertainment/rssfeed.xml',
    'https://timesofindia.indiatimes.com/rssfeeds/1081479906.cms'
  ],
  Product: [
    'https://techcrunch.com/feed/',
    'https://www.theverge.com/rss/index.xml',
    'https://gadgets360.com/rss/feeds'
  ],
  Business: [
    'https://www.livemint.com/rss/business',
    'http://feeds.reuters.com/reuters/businessNews'
  ],
  Science: [
    'https://www.sciencedaily.com/rss/all.xml',
    'https://phys.org/rss-feed/'
  ],
  India: [
    'https://timesofindia.indiatimes.com/rssfeeds/296589292.cms',
    'https://www.thehindu.com/news/national/feeder/default.rss'
  ],
  US: [
    'http://feeds.reuters.com/Reuters/domesticNews',
    'https://feeds.a.dj.com/rss/RSSWSJD.xml'
  ]
};

function normalizeArticle(article: any): Article {
  return {
    slug: article.slug,
    title: article.title,
    summary: article.summary || article.content?.substring(0, 150) + '...' || '',
    content: article.content || '',
    expandedContent: article.expandedContent,
    author: article.author || 'Editorial Team',
    date: article.date || article.publishedAt || article.createdAt || new Date().toISOString(),
    category: article.category as Category,
    tags: article.tags || [article.category],
    imageUrl: article.imageUrl || article.heroImage || '',
    status: article.status || 'published',
    isExpanded: article.isExpanded || false,
    wordCount: article.wordCount,
    metaTitle: article.metaTitle,
    metaDescription: article.metaDescription,
    focusKeyword: article.focusKeyword,
    keywords: article.keywords,
    internalLinks: article.internalLinks,
    externalLinks: article.externalLinks,
    faq: article.faq,
  };
}

const parseRssArticles = async (
  itemsWithCategory: { item: Rss2JsonItem; category: Category }[]
): Promise<Article[]> => {
  const parsedArticles: Article[] = [];

  for (const { item, category } of itemsWithCategory) {
    try {
      const originalTitle = item.title || 'Untitled';
      const originalContent = item.content || item.description || '';

      const slug = (originalTitle + (item.pubDate || ''))
          .toLowerCase()
          .replace(/[^\w\s-]/g, '')
          .replace(/[\s_-]+/g, '-')
          .replace(/^-+|-+$/g, '');

      let imageUrl = '';
      if (item.thumbnail) imageUrl = item.thumbnail;
      if (!imageUrl && item.enclosure?.link && item.enclosure.type?.startsWith('image')) imageUrl = item.enclosure.link;
      if (!imageUrl) {
          imageUrl = `https://picsum.photos/seed/${encodeURIComponent(originalTitle.slice(0, 20))}/800/450`;
      }

      parsedArticles.push({
        slug,
        title: originalTitle,
        summary: (item.description || '').replace(/<[^>]*>?/gm, '').substring(0, 150) + '...',
        content: originalContent,
        author: item.author || 'Editorial Team',
        date: item.pubDate || new Date().toISOString(),
        category: category,
        tags: [category, ...(item.categories || [])].filter((v, i, a) => a.indexOf(v) === i && v),
        imageUrl,
        status: 'published',
      });

    } catch (e) {
      console.error("Error processing an article:", e);
      continue;
    }
  }

  return parsedArticles;
};

export const ArticleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);

  const mergeWithLocalEdits = (fetchedArticles: Article[]) => {
    try {
      const localEdits = localStorage.getItem('ftj_local_article_edits');
      if (localEdits) {
        const edits: Record<string, Partial<Article>> = JSON.parse(localEdits);
        return fetchedArticles.map(art => {
          if (edits[art.slug]) {
            return { ...art, ...edits[art.slug] };
          }
          return art;
        });
      }
    } catch (e) {
      console.error("Failed to merge local edits", e);
    }
    return fetchedArticles;
  };

  const fetchFromMongoDB = useCallback(async (): Promise<{ articles: Article[]; connected: boolean }> => {
    try {
      const response = await fetch(`${API_BASE}/articles?status=published&limit=100`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (data.articles && Array.isArray(data.articles)) {
        console.log(`[useArticles] Fetched ${data.articles.length} articles from MongoDB`);
        return { articles: data.articles.map(normalizeArticle), connected: true };
      }
      return { articles: [], connected: true };
    } catch (e) {
      console.warn('[useArticles] MongoDB fetch failed:', e);
      return { articles: [], connected: false };
    }
  }, []);

  const fetchFromRss = useCallback(async (): Promise<Article[]> => {
    try {
      const feedPromises = Object.entries(feedMap)
        .flatMap(([category, urls]) =>
          (urls ?? []).map(url =>
            fetch(`${RSS2JSON_API_URL}${encodeURIComponent(url)}`)
              .then(res => {
                if (!res.ok) throw new Error(`Failed to fetch ${url} with status ${res.status}`);
                return res.json();
              })
              .then(data => {
                if (data.status !== 'ok' || !data.items) {
                  return [];
                }
                return data.items.map((item: Rss2JsonItem) => ({ item, category: category as Category }));
              })
              .catch(err => {
                console.warn(`RSS Fetch failed for ${url}`, err);
                return [];
              })
          )
        );

      const results = await Promise.allSettled(feedPromises);
      
      const allItemsWithCategory: { item: Rss2JsonItem; category: Category }[] = results
        .filter(result => result.status === 'fulfilled' && Array.isArray(result.value))
        .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);
      
      if (allItemsWithCategory.length === 0) {
        return [];
      }

      const parsed = await parseRssArticles(allItemsWithCategory);
      console.log(`[useArticles] Fetched ${parsed.length} articles from RSS`);
      return parsed;
    } catch (e) {
      console.error('[useArticles] RSS fetch failed:', e);
      return [];
    }
  }, []);

  const refreshArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { articles: mongoArticles, connected } = await fetchFromMongoDB();
      setIsDbConnected(connected);
      
      if (connected && mongoArticles.length > 0) {
        const uniqueArticles = Array.from(new Map(mongoArticles.map(a => [a.slug, a])).values());
        uniqueArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        setArticles(mergeWithLocalEdits(uniqueArticles));
        return;
      }
      
      const rssArticles = await fetchFromRss();
      
      if (rssArticles.length > 0) {
        const uniqueArticles = Array.from(new Map(rssArticles.map(a => [a.title, a])).values());
        uniqueArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        
        const liveTitles = new Set(uniqueArticles.map(a => a.title));
        const nonDuplicateMock = mockArticles.filter(m => !liveTitles.has(m.title));
        
        const combined = [...uniqueArticles, ...nonDuplicateMock];
        setArticles(mergeWithLocalEdits(combined));
        return;
      }
      
      console.warn("[useArticles] No articles from MongoDB or RSS. Serving mock articles.");
      setArticles(mergeWithLocalEdits(mockArticles));
      
    } catch (e: any) {
      console.error("Critical error in fetchArticles:", e);
      setArticles(mergeWithLocalEdits(mockArticles));
      setError("Could not load articles. Showing archive.");
      setIsDbConnected(false);
    } finally {
      setLoading(false);
    }
  }, [fetchFromMongoDB, fetchFromRss]);

  useEffect(() => {
    refreshArticles();
    const intervalId = setInterval(refreshArticles, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [refreshArticles]);

  const updateArticle = useCallback(async (slug: string, updatedData: Partial<Article>) => {
    if (isDbConnected) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/articles/${slug}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updatedData),
        });
        
        if (response.ok) {
          const updated = await response.json();
          setArticles(prev => prev.map(art => 
            art.slug === slug ? normalizeArticle(updated) : art
          ));
          console.log('[useArticles] Article updated in MongoDB');
          return;
        }
      } catch (e) {
        console.warn('[useArticles] Failed to update in MongoDB:', e);
      }
    }
    
    setArticles(prevArticles => {
      const newArticles = prevArticles.map(art => 
        art.slug === slug ? { ...art, ...updatedData, lastModified: new Date().toISOString() } : art
      );
      
      try {
        const currentEdits = JSON.parse(localStorage.getItem('ftj_local_article_edits') || '{}');
        currentEdits[slug] = { ...currentEdits[slug], ...updatedData };
        localStorage.setItem('ftj_local_article_edits', JSON.stringify(currentEdits));
      } catch (e) {
        console.error("Failed to persist edit", e);
      }

      return newArticles;
    });
  }, [isDbConnected]);

  const getArticleBySlug = useCallback((slug: string): Article | undefined => {
    return articles.find(a => a.slug === slug);
  }, [articles]);

  const getArticlesByCategory = useCallback((category: Category): Article[] => {
    return articles.filter(a => a.category === category);
  }, [articles]);

  return (
    <ArticleContext.Provider value={{ 
      articles, 
      loading, 
      error, 
      isDbConnected,
      updateArticle, 
      refreshArticles,
      getArticleBySlug,
      getArticlesByCategory,
    }}>
      {children}
    </ArticleContext.Provider>
  );
};

export const useArticles = (): ArticleContextType => {
  const context = useContext(ArticleContext);
  if (context === undefined) {
    throw new Error('useArticles must be used within an ArticleProvider');
  }
  return context;
};
