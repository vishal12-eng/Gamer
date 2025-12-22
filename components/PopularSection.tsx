import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import { fetchPixabayImage } from '../services/pixabayService';

interface PopularSectionProps {
  articles: Article[];
}

interface PopularCardProps {
  article: Article;
  rank: number;
}

const PopularCard: React.FC<PopularCardProps> = ({ article, rank }) => {
  const [imageUrl, setImageUrl] = useState(article.imageUrl);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      try {
        const pixabayUrl = await fetchPixabayImage(
          article.title,
          article.category,
          article.imageUrl,
          article.summary
        );
        setImageUrl(pixabayUrl);
      } catch (error) {
        console.error('[PopularSection] Failed to load image:', error);
      }
    };
    loadImage();
  }, [article.title, article.category, article.imageUrl, article.summary]);

  const { bg, text } = getCategoryStyle(article.category as Category);

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group flex items-center gap-4 p-3 rounded-xl
        bg-gray-800/50 hover:bg-gray-800
        border border-white/5 hover:border-cyan-400/30
        transition-all duration-300 ease-out
        hover:-translate-y-0.5 hover:shadow-lg hover:shadow-cyan-500/10"
    >
      <div className="relative flex-shrink-0">
        <span className="absolute -top-2 -left-2 z-10 w-6 h-6 flex items-center justify-center
          bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-xs font-bold rounded-full
          shadow-lg shadow-cyan-500/30">
          {rank}
        </span>
        <div className="w-16 h-16 rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt={article.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500
              group-hover:scale-110
              ${!imageLoaded ? 'blur-sm' : 'blur-0'}`}
          />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className={`inline-flex items-center text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${bg} ${text} mb-1`}>
          {getCategoryIcon(article.category as Category, 'w-3 h-3 mr-1')}
          <span>{article.category}</span>
        </div>
        <h4 className="text-sm font-semibold text-gray-200 line-clamp-2 leading-tight
          group-hover:text-cyan-300 transition-colors duration-300">
          {article.title}
        </h4>
      </div>
    </Link>
  );
};

const PopularSection: React.FC<PopularSectionProps> = ({ articles }) => {
  const sortedArticles = [...articles]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Popular</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {sortedArticles.map((article, index) => (
          <PopularCard 
            key={article.slug} 
            article={article} 
            rank={index + 1} 
          />
        ))}
      </div>
    </section>
  );
};

export default PopularSection;
