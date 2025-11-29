
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES } from '../constants';
import LogoIcon from './icons/LogoIcon';
import TwitterIcon from './icons/TwitterIcon';
import LinkedInIcon from './icons/LinkedInIcon';
import SparklesIcon from './icons/SparklesIcon';

const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  
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

  const renderLink = (to: string, text: string) => (
    <li key={text}>
      <Link 
        to={to} 
        className="block text-sm opacity-80 hover:opacity-100 hover:text-cyan-400 transition-all"
      >
        {text}
      </Link>
    </li>
  );
  
  return (
    <footer className="bg-gray-900 dark:bg-black border-t border-cyan-400/20 text-gray-400 w-full">
      {/* Container: Max width 1400px, Centered, Padding 3rem 1.5rem */}
      <div className="mx-auto px-6 py-12 max-w-[1400px]">
        
        {/* Grid: 1 col mobile, 2 cols tablet, 4 cols desktop. Gap 2rem. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Column 1: Brand & Newsletter */}
          {/* Aligned center on mobile/tablet, left on desktop */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left w-full">
             <div className="w-full max-w-[250px] mb-5">
                <Link to="/" className="flex items-center justify-center lg:justify-start space-x-2 text-xl font-bold text-white mb-4">
                  <LogoIcon className="w-7 h-7" />
                  <span>FutureTechJournal</span>
                </Link>
                <p className="text-sm mb-6">
                  The future of technology, AI, and business, delivered today.
                </p>
                
                {/* Newsletter Card: Max width 250px */}
                <div className="bg-gray-800/50 p-4 rounded-lg border border-white/10 w-full">
                    <h4 className="text-white font-semibold mb-2 flex items-center justify-center lg:justify-start text-sm">
                        <SparklesIcon className="w-4 h-4 text-cyan-400 mr-2" />
                        Join the Newsletter
                    </h4>
                    {subscribed ? (
                        <p className="text-xs text-green-400">Thanks for subscribing! 🚀</p>
                    ) : (
                        <form onSubmit={handleSubscribe} className="flex flex-col gap-2">
                            <input 
                                type="email" 
                                placeholder="Enter your email" 
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="bg-gray-900 border border-gray-700 text-white text-xs rounded p-2 focus:ring-1 focus:ring-cyan-500 focus:outline-none w-full"
                                required
                            />
                            <button type="submit" className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-2 rounded transition-colors w-full">
                                Subscribe
                            </button>
                        </form>
                    )}
                </div>
             </div>
          </div>
          
          {/* Column 2: Categories */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="font-semibold text-white mb-[10px] text-base">Categories</h3>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map(cat => renderLink(`/category/${cat.toLowerCase()}`, cat))}
            </ul>
          </div>

          {/* Column 3: Explore */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="font-semibold text-white mb-[10px] text-base">Explore</h3>
            <ul className="space-y-2 text-sm">
              {renderLink('/about', 'About Us')}
              {renderLink('/contact', 'Contact')}
              {renderLink('/sitemap', 'Sitemap')}
            </ul>
          </div>
          
          {/* Column 4: Legal */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <h3 className="font-semibold text-white mb-[10px] text-base">Legal</h3>
            <ul className="space-y-2 text-sm">
              {renderLink('/terms', 'Terms & Conditions')}
              {renderLink('/privacy', 'Privacy Policy')}
              {renderLink('/disclaimer', 'Disclaimer')}
            </ul>
          </div>
        </div>

        {/* Copyright Section */}
        <div className="mt-12 border-t border-gray-500/20 pt-8 flex flex-col sm:flex-row justify-between items-center text-sm">
          <p className="order-2 sm:order-1 mt-4 sm:mt-0 text-center sm:text-left">&copy; {new Date().getFullYear()} FutureTechJournal. All Rights Reserved.</p>
          <div className="order-1 sm:order-2 flex space-x-6">
            <a 
              href="https://twitter.com/tech_futur32551" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on Twitter" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <TwitterIcon className="w-7 h-7 cursor-pointer" />
            </a>
            <a 
              href="https://www.linkedin.com/in/future-tech-journal-354071392/" 
              target="_blank" 
              rel="noopener noreferrer" 
              aria-label="Follow us on LinkedIn" 
              className="text-gray-400 hover:text-white transition-colors"
            >
              <LinkedInIcon className="w-7 h-7 cursor-pointer" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
