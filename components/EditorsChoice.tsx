import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Article, Category } from '../types';
import { getCategoryStyle } from '../utils/categoryStyles';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import { fetchPixabayImage } from '../services/pixabayService';

interface EditorsChoiceProps {
  articles: Article[];
}

interface EditorCardProps {
  article: Article;
}

const EditorCard: React.FC<EditorCardProps> = ({ article }) => {
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
        console.error('[EditorsChoice] Failed to load image:', error);
      }
    };
    loadImage();
  }, [article.title, article.category, article.imageUrl, article.summary]);

  const { bg, text } = getCategoryStyle(article.category as Category);

  return (
    <Link
      to={`/article/${article.slug}`}
      className="group relative rounded-2xl overflow-hidden h-80
        shadow-lg shadow-black/20 hover:shadow-card-hover
        hover:-translate-y-2 hover:scale-[1.01]
        transition-all duration-500 ease-out
        border border-white/5 hover:border-cyan-400/40
        before:absolute before:inset-0 before:rounded-2xl before:transition-opacity before:duration-500
        before:bg-gradient-to-br before:from-cyan-500/10 before:to-purple-500/10 before:opacity-0
        hover:before:opacity-100"
    >
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none z-10">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/20 via-purple-500/20 to-cyan-500/20 blur-xl"></div>
      </div>

      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt={article.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          className={`absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out
            group-hover:scale-110
            ${!imageLoaded ? 'blur-md scale-105' : 'blur-0 scale-100'}`}
        />
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer"></div>
        )}
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-500 group-hover:from-black/95"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/0 via-transparent to-purple-900/0 opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>

      <div className="absolute top-4 left-4">
        <span className="px-2 py-1 text-[10px] font-bold uppercase bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-full">
          Editor's Pick
        </span>
      </div>

      <div className="relative z-20 p-6 flex flex-col h-full justify-end">
        <div className={`inline-flex items-center self-start text-xs font-bold uppercase px-3 py-1.5 rounded-full ${bg} ${text} backdrop-blur-sm mb-3 transition-all duration-500 group-hover:scale-105`}>
          {getCategoryIcon(article.category as Category, 'w-4 h-4 mr-2')}
          <span>{article.category}</span>
        </div>

        <h3 className={`text-xl font-bold mb-3 leading-tight transition-all duration-500
          [text-shadow:0_2px_4px_rgba(0,0,0,0.8)]
          group-hover:[text-shadow:0_4px_20px_rgba(6,182,212,0.6),0_2px_4px_rgba(0,0,0,0.8)]
          text-white group-hover:text-cyan-100`}>
          {article.title}
        </h3>

        <div className="flex items-center text-xs text-gray-400 transition-all duration-300 group-hover:text-gray-300">
          <span className="flex items-center gap-1.5">
            <span className="w-5 h-5 rounded-full bg-gradient-to-br from-cyan-500/30 to-purple-500/30 flex items-center justify-center text-white text-[9px] font-semibold uppercase">
              {article.author.charAt(0)}
            </span>
            <span className="text-gray-200 font-medium">{article.author}</span>
          </span>
          <span className="mx-2 text-cyan-500/50">&bull;</span>
          <span>{new Date(article.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        </div>
      </div>
    </Link>
  );
};

const EditorsChoice: React.FC<EditorsChoiceProps> = ({ articles }) => {
  const editorsPicks = articles
    .filter(article => article.isExpanded)
    .slice(0, 4);
  
  const displayArticles = editorsPicks.length >= 4 
    ? editorsPicks 
    : articles.slice(0, 4);

  return (
    <section className="py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-1 h-8 bg-gradient-to-b from-purple-400 to-cyan-500 rounded-full"></div>
        <h2 className="text-2xl font-bold text-white">Editor's Choice</h2>
        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {displayArticles.map((article) => (
          <EditorCard key={article.slug} article={article} />
        ))}
      </div>
    </section>
  );
};

export default EditorsChoice;
