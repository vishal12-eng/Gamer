import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';

interface InfiniteScrollFeedProps {
  articles: Article[];
  loading?: boolean;
}

const InfiniteScrollFeed: React.FC<InfiniteScrollFeedProps> = ({ articles, loading = false }) => {
  const [displayCount, setDisplayCount] = useState(10);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<HTMLDivElement>(null);

  const displayedArticles = articles.slice(0, displayCount);
  const hasMore = displayCount < articles.length;

  const loadMore = useCallback(() => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    setTimeout(() => {
      setDisplayCount(prev => Math.min(prev + 10, articles.length));
      setIsLoadingMore(false);
    }, 500);
  }, [isLoadingMore, hasMore, articles.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );

    if (observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, isLoadingMore]);

  useEffect(() => {
    setDisplayCount(10);
  }, [articles]);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Latest Articles</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-96 rounded-2xl bg-gray-800 animate-pulse"></div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedArticles.map((article, index) => (
              <ArticleCard key={article.slug} article={article} index={index} />
            ))}
          </div>

          <div ref={observerRef} className="w-full py-8 flex justify-center">
            {isLoadingMore && (
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-cyan-500 animate-spin"></div>
                </div>
                <span className="text-gray-400 text-sm">Loading more articles...</span>
              </div>
            )}
            
            {!hasMore && displayedArticles.length > 0 && (
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-800/50 border border-white/5">
                  <span className="text-gray-400 text-sm">You've reached the end</span>
                  <span className="text-cyan-400">✓</span>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </section>
  );
};

export default InfiniteScrollFeed;
