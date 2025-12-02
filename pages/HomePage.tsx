import React, { useState, useEffect, useRef } from 'react';
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
import { getPageSEO } from '../utils/seoConfig';

const ARTICLES_PER_PAGE = 6;

const HomePage: React.FC = () => {
  const { articles, loading, error } = useArticles();
  const [currentPage, setCurrentPage] = useState(1);
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const heroRef = useRef<HTMLElement>(null);
  const articlesRef = useRef<HTMLElement>(null);
  const [articlesVisible, setArticlesVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsHeroVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setArticlesVisible(true);
        }
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    if (articlesRef.current) {
      observer.observe(articlesRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
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
  const seoData = getPageSEO('home');

  return (
    <div className="space-y-16">
      <SEO 
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url="/"
        schema={[websiteSchema, orgSchema]}
      />
      
      {/* Enhanced Hero Section */}
      <section 
        ref={heroRef}
        className="relative -mt-24 h-[70vh] md:h-[85vh] flex items-center justify-center text-center text-white overflow-hidden"
      >
        {/* Background with parallax-like effect */}
        <div className="absolute inset-0 scale-105">
          <img 
            src={heroArticle.imageUrl} 
            alt={heroArticle.title} 
            className={`w-full h-full object-cover transition-all duration-1000 ${
              heroImageLoaded ? 'blur-0 scale-100' : 'blur-md scale-110'
            }`}
            loading="eager"
            onLoad={() => setHeroImageLoaded(true)}
          />
          {/* Multi-layer gradients */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
        </div>

        {/* Animated floating decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl float-slow"></div>
          <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl float-fast" style={{ animationDelay: '1s' }}></div>
        </div>

        {/* Content with staggered animations */}
        <div 
          className={`relative z-10 p-4 max-w-4xl transition-all duration-1000 ease-out ${
            isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          {/* Category badge with glow */}
          <div 
            className="inline-block mb-6"
            style={{ transitionDelay: '200ms' }}
          >
            <Link 
              to={`/category/${heroArticle.category.toLowerCase()}`} 
              className={`inline-flex items-center text-sm font-bold uppercase tracking-widest ${heroText} 
                px-4 py-2 rounded-full glass-light backdrop-blur-md
                hover:scale-105 transition-all duration-300
                shadow-lg hover:shadow-cyan-500/20`}
            >
              {getCategoryIcon(heroArticle.category as Category, 'w-4 h-4 mr-2')}
              <span>{heroArticle.category}</span>
            </Link>
          </div>

          {/* Title with text shadow */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold my-6 leading-tight
              [text-shadow:0_4px_30px_rgba(0,0,0,0.5)]
              bg-gradient-to-r from-white via-white to-gray-300 bg-clip-text
              transition-all duration-1000 ease-out`}
            style={{ transitionDelay: '400ms' }}
          >
            {heroArticle.title}
          </h1>

          {/* Summary */}
          <p 
            className={`text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto 
              [text-shadow:0_2px_10px_rgba(0,0,0,0.5)]
              transition-all duration-1000 ease-out`}
            style={{ transitionDelay: '600ms' }}
          >
            {heroArticle.summary}
          </p>

          {/* CTA Button with glow effect */}
          <div
            style={{ transitionDelay: '800ms' }}
          >
            <Link 
              to={`/article/${heroArticle.slug}`} 
              className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600 
                text-white font-bold py-4 px-10 rounded-full 
                transition-all duration-500 
                hover:from-cyan-400 hover:to-purple-500
                hover:scale-105 hover:shadow-hero-glow
                btn-ripple"
            >
              <span>Read Article</span>
              <svg 
                className="w-5 h-5 transform group-hover:translate-x-1 transition-transform duration-300" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          {/* Scroll indicator */}
          <div 
            className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            onClick={() => document.getElementById('latest-articles')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ transitionDelay: '1000ms' }}
          >
            <span className="text-xs uppercase tracking-widest text-gray-400">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending Ticker */}
      <TrendingTicker articles={articles} />

      {/* Latest Articles Section with scroll reveal */}
      <section id="latest-articles" ref={articlesRef}>
        <div 
          className={`flex items-center mb-10 transition-all duration-700 ease-out ${
            articlesVisible ? 'opacity-100 translate-y-0' : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="relative">
            <SparklesIcon className="w-10 h-10 text-cyan-400 mr-4 float-slow" />
            <div className="absolute inset-0 bg-cyan-500/30 blur-xl"></div>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold gradient-text-animated">
            Latest Articles
          </h2>
          <div className="ml-4 flex-grow h-px bg-gradient-to-r from-cyan-500/50 via-purple-500/30 to-transparent"></div>
        </div>

        {/* Articles Grid with staggered reveal */}
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-all duration-700 ${
            articlesVisible ? 'opacity-100' : 'opacity-100'
          }`}
        >
          {currentArticles.map((article, index) => (
            <ArticleCard key={article.slug} article={article} index={index} />
          ))}
        </div>

        {/* Pagination */}
        <div className={`mt-12 transition-all duration-700 delay-300 ${
          articlesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </section>
    </div>
  );
};

export default HomePage;
