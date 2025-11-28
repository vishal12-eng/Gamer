import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';
import { findRelevantArticles } from '../services/geminiService';
import { useDebounce } from '../hooks/useDebounce';
import { SearchResultSkeleton } from '../components/SkeletonLoader';
import SearchResultCard from '../components/SearchResultCard';
import SearchIcon from '../components/icons/SearchIcon';
import SparklesIcon from '../components/icons/SparklesIcon';
import ArticleCard from '../components/ArticleCard';
import CloseIcon from '../components/icons/CloseIcon';
import SEO from '../components/SEO';

const SearchPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { articles, loading: articlesLoading } = useArticles();
  
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [results, setResults] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchMethod, setSearchMethod] = useState<'ai' | 'keyword' | null>(null);
  
  const [history, setHistory] = useState<string[]>([]);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const HISTORY_KEY = 'ftj_search_history';

  const debouncedQuery = useDebounce(query, 300);
  
  useEffect(() => {
    try {
      const saved = localStorage.getItem(HISTORY_KEY);
      if (saved) {
        setHistory(JSON.parse(saved));
      }
    } catch (e) { console.error("Failed to load search history", e); }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsHistoryVisible(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const trendingArticles = useMemo(() => {
    return [...articles].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 3);
  }, [articles]);

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim() || articles.length === 0) {
      setResults([]);
      setSearchMethod(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setSearchMethod(null);
    setIsHistoryVisible(false);

    setHistory(prevHistory => {
        const updatedHistory = [searchQuery, ...prevHistory.filter(h => h !== searchQuery)].slice(0, 5);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
        return updatedHistory;
    });

    const articlesToSearch = articles.map(({ slug, title, summary }) => ({ slug, title, summary }));
    const aiResultSlugs = await findRelevantArticles(searchQuery, articlesToSearch);

    if (aiResultSlugs) {
      const aiResults = aiResultSlugs
        .map(slug => articles.find(a => a.slug === slug))
        .filter((a): a is Article => a !== undefined);
      setResults(aiResults);
      setSearchMethod('ai');
    } else {
      const lowercasedQuery = searchQuery.toLowerCase();
      const keywordResults = articles.filter(article => {
        return (
          article.title.toLowerCase().includes(lowercasedQuery) ||
          article.summary.toLowerCase().includes(lowercasedQuery) ||
          article.content.toLowerCase().includes(lowercasedQuery) ||
          article.tags.some(tag => tag.toLowerCase().includes(lowercasedQuery)) ||
          article.category.toLowerCase().includes(lowercasedQuery)
        );
      });
      setResults(keywordResults);
      setSearchMethod('keyword');
    }

    setIsLoading(false);
  }, [articles]);

  useEffect(() => {
    if (debouncedQuery) {
      if (searchParams.get('q') !== debouncedQuery) {
        setSearchParams({ q: debouncedQuery }, { replace: true });
      }
      performSearch(debouncedQuery);
    } else {
      setSearchParams({}, { replace: true });
      setResults([]);
      setSearchMethod(null);
    }
  }, [debouncedQuery, performSearch, setSearchParams, searchParams]);
  
  const handleClearQuery = () => {
    setQuery('');
  };

  const handleHistoryClick = (item: string) => {
    setQuery(item);
  };

  const handleClearHistory = () => {
    setHistory([]);
    setIsHistoryVisible(false);
    localStorage.removeItem(HISTORY_KEY);
  };

  const searchActionSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "url": "https://futuretechjournal50.netlify.app/",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://futuretechjournal50.netlify.app/search?q={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <SEO 
        title={`Search results for "${query}" - FutureTechJournal`}
        description="Search for the latest news in AI, Technology, and Business."
        schema={searchActionSchema}
      />
      <div className="relative mb-8" ref={searchRef}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsHistoryVisible(true)}
          placeholder="Search for articles, topics, or keywords..."
          className="w-full bg-gray-800 border border-gray-700 rounded-full py-4 pl-14 pr-12 text-white text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 focus:shadow-cyan-glow outline-none transition-all"
        />
        <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 pointer-events-none" />
        {query && (
          <button
            onClick={handleClearQuery}
            className="absolute right-5 top-1/2 -translate-y-1/2 w-6 h-6 text-gray-400 hover:text-white transition-colors"
            aria-label="Clear search query"
          >
            <CloseIcon />
          </button>
        )}
        
        {isHistoryVisible && history.length > 0 && results.length === 0 && !isLoading && (
          <div className="absolute top-full mt-2 w-full bg-gray-800/90 backdrop-blur-md border border-white/10 rounded-lg shadow-lg overflow-hidden z-10">
            <ul>
              {history.map((item, index) => (
                <li key={index}>
                  <button type="button" className="w-full text-left px-5 py-3 text-lg text-gray-200 hover:bg-cyan-600/50 flex justify-between items-center" onClick={() => handleHistoryClick(item)}>
                    <span>{item}</span>
                    <span className="text-xs text-gray-500">RECENT</span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="border-t border-white/10">
              <button type="button" className="w-full text-center px-4 py-2 text-sm font-medium text-red-400 hover:bg-red-900/50 transition-colors" onClick={handleClearHistory}>
                Clear History
              </button>
            </div>
          </div>
        )}
      </div>
      
      {isLoading && (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => <SearchResultSkeleton key={i} />)}
        </div>
      )}

      {!isLoading && debouncedQuery && results.length > 0 && (
        <div>
           <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-bold text-white">Search Results</h2>
            {searchMethod && (
              <span className={`flex items-center gap-2 text-xs font-semibold px-3 py-1 rounded-full ${searchMethod === 'ai' ? 'bg-purple-500/20 text-purple-300' : 'bg-gray-700 text-gray-300'}`}>
                {searchMethod === 'ai' && <SparklesIcon className="w-4 h-4" />}
                {searchMethod === 'ai' ? 'AI-Powered Search' : 'Keyword Search'}
              </span>
            )}
           </div>
           <div className="space-y-4">
            {results.map(article => (
              <SearchResultCard key={article.slug} article={article} />
            ))}
           </div>
        </div>
      )}

      {!isLoading && debouncedQuery && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">No results found for "{debouncedQuery}"</p>
          <p className="mt-2 text-gray-500">Try a different search term or check out these trending articles.</p>
        </div>
      )}

      {!isLoading && !debouncedQuery && (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">Search across all articles on FutureTechJournal.</p>
          <p className="mt-2 text-gray-500">Find the latest in tech, AI, business, and more.</p>
        </div>
      )}

      {((!isLoading && !debouncedQuery) || (!isLoading && debouncedQuery && results.length === 0)) && (
        <div className="mt-8">
            <h2 className="text-2xl font-bold text-white mb-6">Trending Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {articlesLoading ? 
                    [...Array(3)].map((_, i) => <SearchResultSkeleton key={i} />) : 
                    trendingArticles.map(article => (
                        <ArticleCard key={article.slug} article={article} />
                    ))
                }
            </div>
        </div>
      )}
    </div>
  );
};

export default SearchPage;
