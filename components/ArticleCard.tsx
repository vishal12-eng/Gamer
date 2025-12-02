import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import { fetchPixabayImage } from '../services/pixabayService';

interface ArticleCardProps {
  article: Article;
  index?: number;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article, index = 0 }) => {
  const [imageUrl, setImageUrl] = useState(article.imageUrl);
  const [isLoading, setIsLoading] = useState(true);
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const loadImage = async () => {
      console.log(`[ArticleCard] useEffect triggered for: "${article.title}"`);
      setIsLoading(true);
      try {
        console.log(`[ArticleCard] Fetching Pixabay image...`);
        const pixabayUrl = await fetchPixabayImage(
          article.title,
          article.category,
          article.imageUrl,
          article.summary
        );
        console.log(`[ArticleCard] Pixabay service returned: ${pixabayUrl}`);
        setImageUrl(pixabayUrl);
      } catch (error) {
        console.error('[ArticleCard] Failed to load Pixabay image:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [article.title, article.category, article.imageUrl]);

  const { bg, text } = getCategoryStyle(article.category as Category);

  const staggerClass = `stagger-${Math.min((index % 6) + 1, 6)}`;

  const CategoryTag = ({ className = '' }: { className?: string }) => (
    <div className={`inline-flex items-center text-xs font-bold uppercase px-3 py-1.5 rounded-full ${bg} ${text} ${className} transition-all duration-500 group-hover:scale-105 group-hover:shadow-lg backdrop-blur-sm`}>
      {getCategoryIcon(article.category as Category, 'w-4 h-4 mr-2')}
      <span>{article.category}</span>
    </div>
  );

  return (
    <Link 
      to={`/article/${article.slug}`} 
      className={`reveal ${staggerClass} block group relative rounded-2xl overflow-hidden h-96 text-white
        shadow-lg shadow-black/20
        hover:shadow-card-hover
        hover:-translate-y-3 hover:scale-[1.02]
        transition-all duration-500 ease-out
        border border-white/5 hover:border-cyan-400/40
        before:absolute before:inset-0 before:rounded-2xl before:transition-opacity before:duration-500
        before:bg-gradient-to-br before:from-cyan-500/10 before:to-purple-500/10 before:opacity-0
        hover:before:opacity-100
        after:absolute after:inset-0 after:rounded-2xl after:transition-opacity after:duration-500
        after:bg-gradient-to-t after:from-cyan-500/5 after:via-transparent after:to-purple-500/5 after:opacity-0
        hover:after:opacity-100`}
    >
      {/* Animated border glow on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl"></div>
      </div>

      {/* Image with blur-up effect */}
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={article.title}
          loading="lazy"
          width="800"
          height="450"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out
            group-hover:scale-110
            ${isLoading || !imageLoaded ? 'blur-md scale-105' : 'blur-0 scale-100'}`}
        />
        {/* Shimmer loading effect */}
        {(isLoading || !imageLoaded) && (
          <div className="absolute inset-0 skeleton-shimmer"></div>
        )}
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent transition-opacity duration-500 group-hover:from-black/95"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/0 via-transparent to-purple-900/0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
      
      {/* Content */}
      <div className="relative z-20 p-6 flex flex-col h-full">
        {/* Top section with animated tag */}
        <div className="flex-shrink-0 transform transition-transform duration-500 group-hover:-translate-y-1">
          <CategoryTag />
        </div>
        
        {/* Bottom section */}
        <div className="mt-auto transform transition-all duration-500 group-hover:translate-y-0">
          <h3 className={`text-2xl font-bold mb-3 leading-tight transition-all duration-500
            [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]
            group-hover:[text-shadow:0_4px_20px_rgba(6,182,212,0.6),0_2px_4px_rgba(0,0,0,0.8)]
            ${text}`}>
            {article.title}
          </h3>
          
          {/* Summary with slide-up reveal */}
          <div className="overflow-hidden">
            <p className="text-sm text-gray-300 mb-4 
              max-h-0 opacity-0 translate-y-4
              group-hover:max-h-24 group-hover:opacity-100 group-hover:translate-y-0
              transition-all duration-500 ease-out delay-100
              [text-shadow:0_1px_3px_rgba(0,0,0,0.9)]
              line-clamp-3">
              {article.summary}
            </p>
          </div>
          
          {/* Author and date with enhanced styling */}
          <div className="flex items-center text-xs text-gray-400 transition-all duration-300 group-hover:text-gray-300">
            <span className="flex items-center gap-1.5">
              <span className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-white text-[10px] font-semibold uppercase">
                {article.author.charAt(0)}
              </span>
              <span className="text-gray-200 font-medium">{article.author}</span>
            </span>
            <span className="mx-2 text-cyan-500/50">&bull;</span>
            <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
          </div>

          {/* Read more indicator */}
          <div className="mt-4 flex items-center gap-2 text-cyan-400 text-sm font-medium opacity-0 translate-x-[-10px] group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-500 delay-150">
            <span>Read Article</span>
            <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
