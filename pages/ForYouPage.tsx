import React, { useState, useEffect } from 'react';
import { useArticles } from '../hooks/useArticles';
import { Article } from '../types';
import ArticleCard from '../components/ArticleCard';
import { ArticleCardSkeleton } from '../components/SkeletonLoader';
import SparklesIcon from '../components/icons/SparklesIcon';
import SEO from '../components/SEO';
import { getPageSEO } from '../utils/seoConfig';

const ForYouPage: React.FC = () => {
  const { articles, loading } = useArticles();
  const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
  const [hasHistory, setHasHistory] = useState(false);
  
  const seoData = getPageSEO('foryou');

  useEffect(() => {
    if (loading || articles.length === 0) {
      return;
    }

    const HISTORY_KEY = 'ftj_view_history';
    const savedHistoryJSON = localStorage.getItem(HISTORY_KEY);
    const history: string[] = savedHistoryJSON ? JSON.parse(savedHistoryJSON) : [];

    if (history.length === 0) {
      setHasHistory(false);
      setRecommendedArticles([]);
      return;
    }
    
    setHasHistory(true);

    const viewedArticles = articles.filter(a => history.includes(a.slug));
    if (viewedArticles.length === 0) {
        setRecommendedArticles([]);
        return;
    }

    const viewedCategories: { [key: string]: number } = {};
    const viewedTags: { [key: string]: number } = {};
    const viewedSlugs = new Set(history);

    viewedArticles.forEach(article => {
      viewedCategories[article.category] = (viewedCategories[article.category] || 0) + 1;
      article.tags.forEach(tag => {
        viewedTags[tag] = (viewedTags[tag] || 0) + 1;
      });
    });

    const recommendations = articles
      .filter(article => !viewedSlugs.has(article.slug))
      .map(article => {
        let score = 0;
        if (viewedCategories[article.category]) {
          score += viewedCategories[article.category] * 2;
        }
        article.tags.forEach(tag => {
          if (viewedTags[tag]) {
            score += viewedTags[tag];
          }
        });
        return { article, score };
      })
      .filter(item => item.score > 0)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return new Date(b.article.date).getTime() - new Date(a.article.date).getTime();
      })
      .map(item => item.article)
      .slice(0, 12);

    setRecommendedArticles(recommendations);

  }, [articles, loading]);

  return (
    <div>
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url="/foryou"
      />

      <div className="flex items-center mb-8">
        <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3" />
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#000000] dark:text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.15)]">
          Articles <span className="text-cyan-400">For You</span>
        </h1>
      </div>
      <p className="mb-8 text-gray-500 dark:text-gray-400">
        Based on your reading history, here are some articles we think you'll enjoy.
      </p>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => <ArticleCardSkeleton key={i} />)}
        </div>
      ) : !hasHistory ? (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">Your recommendations will appear here.</p>
          <p className="mt-2 text-gray-500">Start reading some articles to build your personalized feed!</p>
        </div>
      ) : recommendedArticles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {recommendedArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-xl text-gray-400">We couldn't find any new recommendations for you right now.</p>
          <p className="mt-2 text-gray-500">Check back later or explore other categories!</p>
        </div>
      )}
    </div>
  );
};

export default ForYouPage;
