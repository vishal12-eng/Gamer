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
    return (
      <div className="text-center text-gray-400 text-lg py-20">
        No articles available at the moment.
      </div>
    );
  }

  const heroArticle = articles[0];
  const otherArticles = articles.slice(1);
  const { text: heroText } = getCategoryStyle(heroArticle.category as Category);

  const websiteSchema = generateWebsiteSchema();
  const orgSchema = generateOrganizationSchema();
  const seoData = getPageSEO('home');

  return (
    <div className="space-y-16">
      {/* ================= SEO ================= */}
      <SEO
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url="/"
        schema={[websiteSchema, orgSchema]}
      />

      {/* ================= SITE LEVEL H1 (SEO ONLY) ================= */}
      <h1 className="sr-only">
        FutureTechJournal – AI, Technology & Future Innovation News
      </h1>

      {/* ================= HERO SECTION ================= */}
      <section
        ref={heroRef}
        className="relative -mt-24 h-[70vh] md:h-[85vh] flex items-center justify-center text-center text-white overflow-hidden"
      >
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
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-900/20 via-transparent to-purple-900/20"></div>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0)_0%,rgba(0,0,0,0.5)_100%)]"></div>
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-10 w-32 h-32 bg-cyan-500/10 rounded-full blur-3xl float-slow"></div>
          <div className="absolute top-1/3 right-20 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl float-medium" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-cyan-500/10 rounded-full blur-2xl float-fast" style={{ animationDelay: '1s' }}></div>
        </div>

        <div
          className={`relative z-10 p-4 max-w-4xl transition-all duration-1000 ease-out ${
            isHeroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <div className="inline-block mb-6">
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

          {/* Article Title (kept intentionally) */}
          <h2
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold my-6 leading-tight
            [text-shadow:0_2px_4px_rgba(0,0,0,0.9),0_4px_12px_rgba(0,0,0,0.8),0_8px_24px_rgba(0,0,0,0.7),0_12px_32px_rgba(6,182,212,0.3)]
            bg-gradient-to-r from-white via-white to-white bg-clip-text text-transparent"
          >
            {heroArticle.title}
          </h2>

          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
            {heroArticle.summary}
          </p>

          <Link
            to={`/article/${heroArticle.slug}`}
            className="inline-flex items-center gap-3 bg-gradient-to-r from-cyan-500 to-purple-600
              text-white font-bold py-4 px-10 rounded-full hover:scale-105 transition-all"
          >
            Read Article →
          </Link>
        </div>
      </section>

      <AdBanner placement="home_top" />

      <TrendingTicker articles={articles} />

      <section id="trending-section">
        <TrendingSection articles={articles} />
      </section>

      <AdBanner placement="home_after_card_3" />

      <NewsletterForm />

      <EditorsChoice articles={articles} />

      <PopularSection articles={articles} />

      <AdBanner placement="home_middle" />

      <section id="latest-articles" ref={articlesRef}>
        <div className="flex items-center mb-10">
          <SparklesIcon className="w-10 h-10 text-cyan-400 mr-4" />
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Latest Articles
          </h2>
        </div>

        <InfiniteScrollFeed articles={otherArticles} loading={loading} />

        <AdBanner placement="footer" className="mt-12" />
      </section>

      {/* ================= HOMEPAGE SEO CONTENT ================= */}
      <section className="max-w-4xl mx-auto text-gray-400 text-sm leading-relaxed mt-20 px-4">
        <h2 className="text-xl font-semibold text-white mb-4">
          About FutureTechJournal
        </h2>

        <p className="mb-3">
          FutureTechJournal is a digital publication covering the latest
          developments in artificial intelligence, technology, science,
          business, and global innovation.
        </p>

        <p>
          Our editorial team curates AI news, emerging technology trends,
          scientific discoveries, and future-focused insights to help readers
          stay informed about innovations shaping tomorrow.
        </p>
      </section>

      <StickyBottomBanner />
    </div>
  );
};

export default HomePage;
