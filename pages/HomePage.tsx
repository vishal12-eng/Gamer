import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import ArticleCard from '../components/ArticleCard';
import TrendingTicker from '../components/TrendingTicker';
import SparklesIcon from '../components/icons/SparklesIcon';
import Pagination from '../components/Pagination';
import { getCategoryStyle } from '../utils/categoryStyles';
import { Category } from '../types';
import { useArticles } from '../hooks/useArticles';
import { HomePageSkeleton } from '../components/SkeletonLoader';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import SEO from '../components/SEO';
import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/seoHelpers';

const ARTICLES_PER_PAGE = 6;

const HomePage: React.FC = () => {
  const { articles, loading, error } = useArticles();
  const [currentPage, setCurrentPage] = useState(1);
  
  if (loading && articles.length === 0) {
    return <HomePageSkeleton />;
  }

  if (error) {
    return <div className="text-center text-red-400 text-lg py-20">{error}</div>;
  }
  
  if (articles.length === 0) {
      return <div className="text-center text-gray-400 text-lg py-20">No articles available at the moment.</div>;
  }

  const heroArticle = articles[0];
  const otherArticles = articles.slice(1);
  const { text: heroText } = getCategoryStyle(heroArticle.category as Category);

  const totalPages = Math.ceil(otherArticles.length / ARTICLES_PER_PAGE);
  const startIndex = (currentPage - 1) * ARTICLES_PER_PAGE;
  const endIndex = startIndex + ARTICLES_PER_PAGE;
  const currentArticles = otherArticles.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const section = document.getElementById('latest-articles');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const websiteSchema = generateWebsiteSchema();
  const orgSchema = generateOrganizationSchema();

  return (
    <div className="space-y-16">
      <SEO 
        title="FutureTechJournal – The Future of AI, Technology, Business & Global News"
        schema={[websiteSchema, orgSchema]}
      />
      
      <section className="relative -mt-24 h-[60vh] md:h-[80vh] flex items-center justify-center text-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <img 
            src={heroArticle.imageUrl} 
            alt={heroArticle.title} 
            className="w-full h-full object-cover"
            loading="eager" 
          />
          <div className="absolute inset-0 bg-black/60"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent"></div>
        </div>
        <div className="relative z-10 p-4 max-w-4xl">
          <Link to={`/category/${heroArticle.category.toLowerCase()}`} className={`inline-flex items-center text-sm font-bold uppercase tracking-widest ${heroText}`}>
            {getCategoryIcon(heroArticle.category as Category, 'w-4 h-4 mr-2')}
            <span>{heroArticle.category}</span>
          </Link>
          <h1 className={`text-4xl sm:text-5xl md:text-6xl font-extrabold my-4 leading-tight [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]`}>
            {heroArticle.title}
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
            {heroArticle.summary}
          </p>
          <Link to={`/article/${heroArticle.slug}`} className="bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold py-3 px-8 rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-hero-glow">
            Read Article
          </Link>
        </div>
      </section>

      <TrendingTicker articles={articles} />

      <section id="latest-articles">
        <div className="flex items-center mb-8">
            <SparklesIcon className="w-8 h-8 text-cyan-400 mr-3" />
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-400">Latest Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {currentArticles.map((article) => (
            <ArticleCard key={article.slug} article={article} />
          ))}
        </div>
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
        />
      </section>
    </div>
  );
};

export default HomePage;
