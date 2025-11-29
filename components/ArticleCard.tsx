import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { slugify } from '../utils/slugify';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import { fetchPixabayImage } from '../services/pixabayService';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const [imageUrl, setImageUrl] = useState(article.imageUrl);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadImage = async () => {
      setIsLoading(true);
      try {
        const pixabayUrl = await fetchPixabayImage(
          article.title,
          article.category,
          article.imageUrl
        );
        setImageUrl(pixabayUrl);
      } catch (error) {
        console.error('Failed to load Pixabay image:', error);
        // Keep original URL on error
      } finally {
        setIsLoading(false);
      }
    };

    loadImage();
  }, [article.title, article.category, article.imageUrl]);

  const { bg, text } = getCategoryStyle(article.category as Category);

  const CategoryTag = ({ className = '' }: { className?: string }) => (
    <div className={`inline-flex items-center text-xs font-bold uppercase px-2 py-1 rounded ${bg} ${text} ${className} transition-all duration-300 group-hover:brightness-125`}>
      {getCategoryIcon(article.category as Category, 'w-4 h-4 mr-2')}
      <span>{article.category}</span>
    </div>
  );

  return (
    <Link 
      to={`/article/${article.slug}`} 
      className="block group relative rounded-xl overflow-hidden shadow-lg hover:shadow-cyan-glow dark:hover:shadow-purple-glow hover:-translate-y-2 transition-all duration-500 border border-white/10 hover:border-cyan-400/50 h-96 text-white"
    >
      <img
        src={imageUrl}
        alt={article.title}
        loading="lazy"
        width="800"
        height="450"
        className={`absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ${
          isLoading ? 'opacity-50' : 'opacity-100'
        }`}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
      
      <div className="relative p-6 flex flex-col h-full">
        {/* Top section */}
        <div className="flex-shrink-0">
          <CategoryTag />
        </div>
        
        {/* Bottom section pushed down by mt-auto */}
        <div className="mt-auto">
          <h3 className={`text-2xl font-bold mb-3 transition-colors group-hover:text-cyan-400 [text-shadow:0_2px_4px_rgba(0,0,0,0.6)] group-hover:[text-shadow:0_2px_10px_rgba(6,182,212,0.8)] ${text}`}>
            {article.title}
          </h3>
          <p className="text-sm text-gray-300 mb-4 max-h-0 opacity-0 group-hover:max-h-24 group-hover:opacity-100 transition-all duration-500 ease-in-out overflow-hidden [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            {article.summary}
          </p>
          <div className="flex items-center text-xs text-gray-400">
            <span>By <span className="z-10 relative text-gray-200">{article.author}</span></span>
            <span className="mx-2">&bull;</span>
            <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ArticleCard;
