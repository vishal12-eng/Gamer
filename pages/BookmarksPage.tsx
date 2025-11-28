

import React, { useState, useEffect } from 'react';
import ArticleCard from '../components/ArticleCard';
import { Article } from '../types';
import { useArticles } from '../hooks/useArticles';
import { ArticleCardSkeleton } from '../components/SkeletonLoader';

const BookmarksPage: React.FC = () => {
  const [bookmarkedArticles, setBookmarkedArticles] = useState<Article[]>([]);
  const { articles, loading } = useArticles();

  const updateBookmarks = React.useCallback(() => {
    if (loading) return;
    const savedSlugsJSON = localStorage.getItem('bookmarked_articles');
    const savedSlugs: string[] = savedSlugsJSON ? JSON.parse(savedSlugsJSON) : [];
    const filteredArticles = articles.filter(article => savedSlugs.includes(article.slug));
    setBookmarkedArticles(filteredArticles);
  }, [articles, loading]);

  useEffect(() => {
    updateBookmarks();
  }, [updateBookmarks]);

  useEffect(() => {
    const handleStorageChange = () => {
        updateBookmarks();
    };

    window.addEventListener('storage', handleStorageChange);
    document.addEventListener('visibilitychange', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      document.removeEventListener('visibilitychange', handleStorageChange);
    };
  }, [updateBookmarks]);

  return (
    <div>
      <h1 className="text-3xl md:text-4xl font-extrabold mb-8 text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
        My <span className="text-cyan-400">Bookmarks</span>
      </h1>
      
      {loading && bookmarkedArticles.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => <ArticleCardSkeleton key={i} />)}
        </div>
      ) : bookmarkedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bookmarkedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
            <p className="text-xl text-gray-400">You haven't bookmarked any articles yet.</p>
            <p className="mt-2 text-gray-500">Find an article you like and click the bookmark icon to save it for later.</p>
        </div>
      )}
    </div>
  );
};

export default BookmarksPage;
