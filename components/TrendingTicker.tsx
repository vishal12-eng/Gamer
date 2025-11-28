
import React from 'react';
import { Link } from 'react-router-dom';
import { Article } from '../types';

interface TrendingTickerProps {
  articles: Article[];
}

const TrendingTicker: React.FC<TrendingTickerProps> = ({ articles }) => {
  const trendingArticles = articles.slice(0, 5);

  return (
    <div className="relative w-full h-10 overflow-hidden bg-gray-800 dark:bg-gray-900 border-y border-gray-500/30">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full flex items-center animate-ticker-scroll">
          {trendingArticles.map((article, index) => (
            <div key={index} className="flex-shrink-0 flex items-center mx-8">
              <span className="text-xs font-bold uppercase text-cyan-400 mr-4">TRENDING</span>
              <Link to={`/article/${article.slug}`} className="text-sm text-gray-200 hover:text-white transition-colors whitespace-nowrap">
                {article.title}
              </Link>
            </div>
          ))}
          {/* Duplicate for seamless loop */}
           {trendingArticles.map((article, index) => (
            <div key={`dup-${index}`} className="flex-shrink-0 flex items-center mx-8">
              <span className="text-xs font-bold uppercase text-cyan-400 mr-4">TRENDING</span>
              <Link to={`/article/${article.slug}`} className="text-sm text-gray-200 hover:text-white transition-colors whitespace-nowrap">
                {article.title}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrendingTicker;
