
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Article, Category } from '../types';
import { mockArticles } from '../pages/data/mockData';

const RSS2JSON_API_URL = 'https://api.rss2json.com/v1/api.json?rss_url=';
const REFRESH_INTERVAL = 30 * 60 * 1000; // 30 minutes

interface ArticleContextType {
  articles: Article[];
  loading: boolean;
  error: string | null;
  updateArticle: (slug: string, updatedData: Partial<Article>) => void;
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

const parseArticles = async (
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
        status: 'published', // Default for RSS items
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

  // Helper to merge local edits with fetched data
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

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    setError(null);
    
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
             console.warn("No RSS items found. Serving mock articles.");
             setArticles(mergeWithLocalEdits(mockArticles));
             setLoading(false);
             return;
        }

      const parsed = await parseArticles(allItemsWithCategory);
      const uniqueArticles = Array.from(new Map(parsed.map(article => [article.title, article])).values());
      uniqueArticles.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      const liveTitles = new Set(uniqueArticles.map(a => a.title));
      const nonDuplicateMock = mockArticles.filter(m => !liveTitles.has(m.title));
      
      // Merge live/mock data THEN apply local edits on top
      const combined = [...uniqueArticles, ...nonDuplicateMock];
      setArticles(mergeWithLocalEdits(combined));

    } catch (e: any) {
      console.error("Critical error in fetchArticles:", e);
      setArticles(mergeWithLocalEdits(mockArticles));
      setError("Could not load live feed. Showing archive.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArticles();
    const intervalId = setInterval(fetchArticles, REFRESH_INTERVAL);
    return () => clearInterval(intervalId);
  }, [fetchArticles]);

  // NEW: Function to update article locally and persist
  const updateArticle = (slug: string, updatedData: Partial<Article>) => {
    setArticles(prevArticles => {
      const newArticles = prevArticles.map(art => 
        art.slug === slug ? { ...art, ...updatedData, lastModified: new Date().toISOString() } : art
      );
      
      // Persist to local storage to survive refreshes (simulating DB save)
      try {
        const currentEdits = JSON.parse(localStorage.getItem('ftj_local_article_edits') || '{}');
        currentEdits[slug] = { ...currentEdits[slug], ...updatedData };
        localStorage.setItem('ftj_local_article_edits', JSON.stringify(currentEdits));
      } catch (e) {
        console.error("Failed to persist edit", e);
      }

      return newArticles;
    });
  };

  return (
    <ArticleContext.Provider value={{ articles, loading, error, updateArticle }}>
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
