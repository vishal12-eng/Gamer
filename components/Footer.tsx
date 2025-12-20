import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import LogoIcon from './icons/LogoIcon';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import SparklesIcon from './icons/SparklesIcon';
import { AdPreferencesLink } from './ConsentBanner';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const footerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  const isActiveCategory = (categoryPath: string): boolean => {
    const pathname = location.pathname.toLowerCase();
    const category = categoryPath.replace('/category/', '').toLowerCase();
    
    if (pathname.includes(`/category/${category}`)) {
      return true;
    }
    
    if (pathname.startsWith('/article/')) {
      const articleSlug = pathname.replace('/article/', '');
      if (articleSlug.includes(category) || articleSlug.includes(category.replace(' ', '-'))) {
        return true;
      }
    }
    
    return false;
  };
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      try {
        const response = await fetch('/api/mailchimpSubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email }),
        });

        const data = await response.json();
        if (response.ok && data.success) {
          setSubscribed(true);
          setEmail('');
          setTimeout(() => setSubscribed(false), 5000);
        } else {
          alert(data.error || 'Subscription failed. Please try again.');
        }
      } catch (error) {
        console.error('Subscribe error:', error);
        alert('Error subscribing. Please try again.');
      }
    }
  };

  const renderLink = (to: string, text: string, isCategory = false) => {
    const isActive = isCategory && isActiveCategory(to);
    
    return (
      <li key={text}>
        <Link 
          to={to} 
          className={`group block text-sm transition-all duration-300 py-1 ${
            isActive 
              ? 'text-cyan-400 font-semibold' 
              : 'text-gray-400 hover:text-cyan-400'
          }`}
        >
          <span className="relative">
            {text}
            <span className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-cyan-400 to-purple-400 transition-all duration-300 ${
              isActive ? 'w-full' : 'w-0 group-hover:w-full'
            }`}></span>
          </span>
        </Link>
      </li>
    );
  };
  
  return (
    <footer 
      ref={footerRef}
      className="relative bg-gray-900 dark:bg-black/90 text-gray-400 w-full overflow-hidden"
    >
      {/* Animated gradient border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"></div>
      
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative mx-auto px-6 py-16 max-w-[1400px]">
        
        <div 
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          
          {/* Column 1: Brand & Newsletter */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full">
             <div className="w-full max-w-[280px] mb-5">
                <Link to="/" className="group flex items-center justify-center lg:justify-start space-x-3 text-xl font-bold text-white mb-5">
                  <div className="relative">
                    <LogoIcon className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" />
                    <div className="absolute inset-0 bg-cyan-500/30 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                  <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-purple-300 transition-all duration-300">
                    FutureTechJournal
                  </span>
                </Link>
                <p className="text-sm text-gray-400 mb-6 leading-relaxed">
                  The future of technology, AI, and business, delivered today.
                </p>
                
                {/* Newsletter Card */}
                <div className="glass-card p-5 rounded-xl hover-glow-cyan transition-all duration-300">
                    <h4 className="text-white font-semibold mb-3 flex items-center justify-center lg:justify-start text-sm">
                        <SparklesIcon className="w-5 h-5 text-cyan-400 mr-2 float-slow" />
                        <span className="gradient-text">Join the Newsletter</span>
                    </h4>
                    {subscribed ? (
                        <div className="flex items-center justify-center gap-2 text-green-400 text-sm py-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>Thanks for subscribing!</span>
                        </div>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-800/50 border border-white/10 text-white text-sm rounded-lg p-3 
                                  focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/50 focus:outline-none 
                                  transition-all duration-300 placeholder-gray-500"
                                required
                            />
                            <button 
                              type="submit" 
                              className="relative overflow-hidden bg-gradient-to-r from-cyan-500 to-purple-600 
                                hover:from-cyan-400 hover:to-purple-500 
                                text-white text-sm font-bold py-3 rounded-lg 
                                transition-all duration-300 hover:shadow-hero-glow btn-ripple"
                            >
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
             </div>
          </div>
          
          {/* Column 2: Categories */}
          <div 
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            style={{ transitionDelay: '100ms' }}
          >
            <h3 className="font-semibold text-white mb-4 text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full"></span>
              Categories
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map(cat => renderLink(`/category/${cat.toLowerCase()}`, cat, true))}
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div 
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            style={{ transitionDelay: '200ms' }}
          >
            <h3 className="font-semibold text-white mb-4 text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full"></span>
              Explore
            </h3>
            <ul className="space-y-2">
              {renderLink('/about', 'About Us')}
              {renderLink('/contact', 'Contact')}
              {renderLink('/sitemap', 'Sitemap')}
            </ul>
          </div>
          
          {/* Column 4: Legal */}
          <div 
            className="flex flex-col items-center lg:items-start text-center lg:text-left"
            style={{ transitionDelay: '300ms' }}
          >
            <h3 className="font-semibold text-white mb-4 text-base flex items-center gap-2">
              <span className="w-1 h-4 bg-gradient-to-b from-cyan-400 to-purple-400 rounded-full"></span>
              Legal
            </h3>
            <ul className="space-y-2">
              {renderLink('/terms', 'Terms & Conditions')}
              {renderLink('/privacy', 'Privacy Policy')}
              {renderLink('/disclaimer', 'Disclaimer')}
              <li>
                <AdPreferencesLink />
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div 
          className={`mt-14 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center text-sm transition-all duration-1000 delay-500 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}
        >
          <p className="order-2 sm:order-1 mt-4 sm:mt-0 text-center sm:text-left text-gray-500">
            &copy; {new Date().getFullYear()} FutureTechJournal. All Rights Reserved.
          </p>
          <div className="order-1 sm:order-2 flex space-x-4">
            <a 
              href="https://twitter.com/tech_futur32551" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on Twitter" 
              className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-cyan-500/50 transition-all duration-300 hover:shadow-cyan-glow"
            >
              <TwitterIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </a>
            <a 
              href="https://www.linkedin.com/in/future-tech-journal-354071392/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on LinkedIn" 
              className="group relative w-10 h-10 flex items-center justify-center rounded-full bg-white/5 border border-white/10 text-gray-400 hover:text-white hover:border-purple-500/50 transition-all duration-300 hover:shadow-purple-glow"
            >
              <LinkedInIcon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
