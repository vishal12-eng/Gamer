import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import TrendingTicker from '../components/TrendingTicker';
import TrendingSection from '../components/TrendingSection';
import NewsletterForm from '../components/NewsletterForm';
import EditorsChoice from '../components/EditorsChoice';
import PopularSection from '../components/PopularSection';
import InfiniteScrollFeed from '../components/InfiniteScrollFeed';
import SparklesIcon from '../components/icons/SparklesIcon';
import { getCategoryStyle } from '../utils/categoryStyles';
import { Category } from '../types';
import { useArticles } from '../hooks/useArticles';
import { HomePageSkeleton } from '../components/SkeletonLoader';
import { getCategoryIcon } from '../utils/getCategoryIcon';
import SEO from '../components/SEO';
import { generateOrganizationSchema, generateWebsiteSchema } from '../utils/seoHelpers';
import { getPageSEO } from '../utils/seoConfig';
import AdBanner, { StickyBottomBanner } from '../components/AdBanner';

const HomePage: React.FC = () => {
  const { articles, loading, error } = useArticles();
  const [heroImageLoaded, setHeroImageLoaded] = useState(false);
  const [isHeroVisible, setIsHeroVisible] = useState(true);
  const heroRef = useRef<HTMLElement>(null);
  const articlesRef = useRef<HTMLElement>(null);
  const [articlesVisible, setArticlesVisible] = useState(true);

  useEffect(() => {
    setIsHeroVisible(true);
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
                px-4 py-2 rounded-full glass-light dark:bg-white/10 dark:backdrop-blur-md
                hover:scale-105 transition-all duration-300
                shadow-lg hover:shadow-cyan-500/20`}
            >
              {getCategoryIcon(heroArticle.category as Category, 'w-4 h-4 mr-2')}
              <span>{heroArticle.category}</span>
            </Link>
          </div>

          {/* Title with enhanced styling */}
          <h1 
            className={`text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold my-6 leading-tight
              [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_4px_12px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.7),0_12px_32px_rgba(6,182,212,0.3)]
              bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent
              drop-shadow-2xl
              transition-all duration-1000 ease-out
              hover:from-cyan-100 hover:via-white hover:to-cyan-100`}
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
                text-white dark:text-white font-bold py-4 px-10 rounded-full 
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
            onClick={() => document.getElementById('trending-section')?.scrollIntoView({ behavior: 'smooth' })}
            style={{ transitionDelay: '1000ms' }}
          >
            <span className="text-xs uppercase tracking-widest text-gray-400">Scroll</span>
            <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
              <div className="w-1.5 h-3 bg-white/60 rounded-full animate-bounce"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad Banner - After Hero */}
      <AdBanner placement="home_top" />

      {/* Trending Ticker */}
      <TrendingTicker articles={articles} />

      {/* Trending Section - Top 5 articles horizontal slider */}
      <section id="trending-section">
        <TrendingSection articles={articles} />
      </section>

      {/* Ad Banner - After Trending */}
      <AdBanner placement="home_after_card_3" />

      {/* Newsletter Signup Section */}
      <section>
        <NewsletterForm />
      </section>

      {/* Editor's Choice Section - 4 expanded/featured articles */}
      <section>
        <EditorsChoice articles={articles} />
      </section>

      {/* Popular Section - 10 articles ranked by date */}
      <section>
        <PopularSection articles={articles} />
      </section>

      {/* Ad Banner - Home Middle */}
      <AdBanner placement="home_middle" />

      {/* Infinite Scroll Feed - Latest Articles */}
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
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Latest Articles
          </h2>
          <div className="ml-4 flex-grow h-px bg-gradient-to-r from-cyan-500/50 via-purple-500/30 to-transparent"></div>
        </div>

        {/* Infinite Scroll Feed - replaces pagination */}
        <InfiniteScrollFeed articles={otherArticles} loading={loading} />

        {/* Ad Banner - Above Footer */}
        <AdBanner placement="footer" className="mt-12" />
      </section>

      {/* Mobile Sticky Bottom Banner */}
      <StickyBottomBanner />
    </div>
  );
};

export default HomePage;
