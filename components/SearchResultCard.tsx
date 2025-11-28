import React from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { slugify } from '../utils/slugify';

interface SearchResultCardProps {
  article: Article;
}

const SearchResultCard: React.FC<SearchResultCardProps> = ({ article }) => {
  const { bg, text } = getCategoryStyle(article.category as Category);

  return (
    <Link 
      to={`/article/${article.slug}`} 
      className="block group bg-gray-800/50 hover:bg-gray-800/80 p-4 rounded-lg transition-all duration-300 border border-transparent hover:border-cyan-500/50"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="w-full sm:w-48 flex-shrink-0">
          <img
            src={article.imageUrl}
            alt={article.title}
            loading="lazy"
            className="w-full h-40 sm:h-36 object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
          />
        </div>
        <div className="flex-1">
          <div className={`inline-block text-xs font-bold uppercase px-2 py-1 rounded mb-2 ${bg} ${text}`}>
            <span>{article.category}</span>
          </div>
          <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors mb-2">
            {article.title}
          </h3>
          <p className="text-sm text-gray-400 mb-3 line-clamp-2">
            {article.summary}
          </p>
          <div className="flex items-center text-xs text-gray-500">
            <span>By <span className="text-gray-300">{article.author}</span></span>
            <span className="mx-2">&bull;</span>
            <span>{new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long' })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default SearchResultCard;
