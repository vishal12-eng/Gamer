import React, { useState, useEffect, useCallback } from 'react';
import { useAds } from '../context/AdsContext';

const StickySidebarAd: React.FC = () => {
  const { getActiveAdsByPlacement } = useAds();
  const ads = getActiveAdsByPlacement('category_sidebar');
  
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const checkScrollPosition = useCallback(() => {
    const heroHeight = 500;
    const scrollY = window.scrollY;
    setIsVisible(scrollY > heroHeight);
  }, []);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('sidebar_ad_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    
    window.addEventListener('scroll', checkScrollPosition);
    checkScrollPosition();
    
    return () => window.removeEventListener('scroll', checkScrollPosition);
  }, [checkScrollPosition]);

  useEffect(() => {
    if (ads.length > 1 && isVisible && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads.length, isVisible, isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('sidebar_ad_dismissed', 'true');
  };

  const handleClick = () => {
    const currentAd = ads[currentIndex];
    if (currentAd?.smartlinkUrl) {
      window.open(currentAd.smartlinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isDismissed || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];
  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <div 
      className={`hidden lg:block fixed right-4 xl:right-8 top-1/2 -translate-y-1/2 z-40 w-[160px]
        transition-all duration-500 ease-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 pointer-events-none'}`}
    >
      <div 
        className={`relative rounded-xl overflow-hidden cursor-pointer
          ${isDarkMode 
            ? 'bg-gradient-to-b from-gray-800/95 via-gray-900/95 to-gray-800/95 border border-white/10' 
            : 'bg-gradient-to-b from-white via-gray-50 to-white border border-gray-200'
          }
          shadow-2xl hover:shadow-cyan-500/20 transition-shadow duration-300`}
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-purple-500/5 to-cyan-500/5" />
        
        <button
          onClick={handleDismiss}
          className={`absolute top-2 right-2 z-10 w-6 h-6 rounded-full flex items-center justify-center transition-colors
            ${isDarkMode 
              ? 'bg-gray-800/80 hover:bg-gray-700 text-gray-400 hover:text-white' 
              : 'bg-white/80 hover:bg-gray-100 text-gray-500 hover:text-gray-700'
            }`}
          aria-label="Close ad"
        >
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className={`absolute top-2 left-2 text-[10px] px-1.5 py-0.5 rounded z-10
          ${isDarkMode ? 'bg-black/50 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
          Ad
        </div>

        <div className="relative p-4 pt-8">
          {currentAd.imageUrl ? (
            <div className="mb-3">
              <img 
                src={currentAd.imageUrl} 
                alt={currentAd.title || 'Advertisement'}
                className="w-full h-20 object-cover rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            </div>
          ) : (
            <div className={`w-10 h-10 mx-auto mb-3 rounded-lg flex items-center justify-center
              bg-gradient-to-br from-cyan-500 to-purple-600`}>
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
          )}

          <p className={`text-xs font-semibold text-center mb-2 line-clamp-2
            ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {currentAd.title || 'Special Offer'}
          </p>
          
          <p className={`text-[10px] text-center mb-3
            ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            Sponsored
          </p>

          <div className="w-full px-3 py-1.5 rounded-full text-[10px] font-semibold text-center
            bg-gradient-to-r from-cyan-500 to-purple-600 text-white
            hover:from-cyan-400 hover:to-purple-500 transition-all duration-300">
            Learn More
          </div>
        </div>

        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {ads.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1 h-1 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-cyan-400 w-2' : 'bg-gray-500/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StickySidebarAd;
