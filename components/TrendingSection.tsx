import React from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { getCategoryIcon } from '../utils/getCategoryIcon';

interface TrendingSectionProps {
  articles: Article[];
}

const TrendingSection: React.FC<TrendingSectionProps> = ({ articles }) => {
  const trendingArticles = articles.slice(0, 5);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Trending Now</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
      </div>

      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {trendingArticles.map((article, index) => {
            const { bg, text } = getCategoryStyle(article.category as Category);
            
            return (
              <Link
                key={article.slug}
                to={`/article/${article.slug}`}
                className="group flex-shrink-0 w-72 snap-start"
              >
                <div className={`relative h-32 rounded-xl overflow-hidden
                  bg-gradient-to-br from-gray-800 via-gray-900 to-gray-800
                  border border-white/5 hover:border-cyan-400/40
                  shadow-lg shadow-black/20 hover:shadow-cyan-500/20
                  hover:-translate-y-1 hover:scale-[1.02]
                  transition-all duration-300 ease-out
                  before:absolute before:inset-0 before:rounded-xl
                  before:bg-gradient-to-br before:from-cyan-500/10 before:to-purple-500/10 
                  before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300`}
                >
                  <div className="absolute top-0 left-0 w-8 h-8 flex items-center justify-center 
                    bg-gradient-to-br from-cyan-500 to-purple-600 text-white text-sm font-bold
                    rounded-br-xl rounded-tl-xl">
                    {index + 1}
                  </div>

                  <div className="relative z-10 p-4 pt-3 pl-12 flex flex-col h-full justify-between">
                    <div className={`inline-flex items-center self-start text-[10px] font-bold uppercase px-2 py-1 rounded-full ${bg} ${text} backdrop-blur-sm`}>
                      {getCategoryIcon(article.category as Category, 'w-3 h-3 mr-1')}
                      <span>{article.category}</span>
                    </div>

                    <h3 className={`text-sm font-semibold leading-tight text-gray-200 line-clamp-2
                      group-hover:text-cyan-300 transition-colors duration-300
                      [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]`}>
                      {article.title}
                    </h3>
                  </div>

                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 blur-sm"></div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="absolute right-0 top-0 bottom-4 w-16 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none"></div>
      </div>
    </section>
  );
};

export default TrendingSection;
