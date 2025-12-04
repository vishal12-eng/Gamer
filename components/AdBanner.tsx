import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAds, AdPlacement } from '../context/AdsContext';

const ROTATION_INTERVAL = 10000;

interface AdBannerProps {
  placement: AdPlacement;
  className?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({ placement, className = '' }) => {
  const { getActiveAdsByPlacement } = useAds();
  const ads = getActiveAdsByPlacement(placement);
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const rotateAd = useCallback(() => {
    if (ads.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }
  }, [ads.length]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [ads.length]);

  useEffect(() => {
    if (ads.length > 1 && !isHovered) {
      intervalRef.current = setInterval(rotateAd, ROTATION_INTERVAL);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [rotateAd, isHovered, ads.length]);

  const currentAd = ads[currentIndex];

  const handleClick = () => {
    if (currentAd?.smartlinkUrl) {
      window.open(currentAd.smartlinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (ads.length === 0) {
    return null;
  }

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const isCompact = placement === 'home_after_card_3' || placement === 'article_middle';

  if (currentAd.imageUrl) {
    return (
      <div 
        className={`relative w-full overflow-hidden rounded-xl cursor-pointer 
          transition-all duration-300 ease-out my-6
          ${className}`}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        role="button"
        aria-label={currentAd.title || 'Sponsored content'}
      >
        <div className={`relative w-full ${isCompact ? 'h-[120px] md:h-[160px]' : 'h-[160px] md:h-[220px]'} overflow-hidden rounded-xl
          shadow-lg hover:shadow-2xl transform hover:scale-[1.01] transition-all duration-300`}
        >
          <img 
            src={currentAd.imageUrl} 
            alt={currentAd.title || 'Advertisement'}
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300" />
          <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded
            ${isDarkMode ? 'bg-black/50 text-gray-400' : 'bg-white/80 text-gray-500'}`}>
            Ad
          </div>
        </div>
        
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {ads.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-white w-3' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div 
      className={`relative w-full overflow-hidden rounded-xl cursor-pointer 
        transition-all duration-300 ease-out my-6
        ${className}`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      aria-label={currentAd.title || 'Sponsored content'}
    >
      <div 
        className={`relative w-full ${isCompact ? 'h-[120px] md:h-[160px]' : 'h-[160px] md:h-[220px]'} overflow-hidden rounded-xl
          ${isDarkMode 
            ? 'bg-gradient-to-br from-gray-800/90 via-gray-900/95 to-black border border-white/10' 
            : 'bg-gradient-to-br from-gray-100 via-white to-gray-50 border border-gray-200'
          }
          shadow-lg hover:shadow-2xl
          transform hover:scale-[1.01] transition-all duration-300`}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-purple-500/10 to-cyan-500/10 opacity-0 hover:opacity-100 transition-opacity duration-500" />
        
        <div className="absolute inset-0 overflow-hidden">
          <div className={`absolute -top-20 -right-20 w-40 h-40 rounded-full blur-3xl
            ${isDarkMode ? 'bg-cyan-500/20' : 'bg-cyan-400/30'}`} />
          <div className={`absolute -bottom-20 -left-20 w-40 h-40 rounded-full blur-3xl
            ${isDarkMode ? 'bg-purple-500/20' : 'bg-purple-400/30'}`} />
        </div>

        <div className="relative z-10 flex flex-col items-center justify-center h-full p-4 md:p-6 text-center">
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium mb-2 md:mb-3
            ${isDarkMode 
              ? 'bg-white/10 text-gray-300 border border-white/10' 
              : 'bg-gray-900/10 text-gray-600 border border-gray-200'
            }`}>
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Sponsored</span>
          </div>
          
          <h3 className={`text-base md:text-xl lg:text-2xl font-bold mb-1 md:mb-2 leading-tight
            ${isDarkMode 
              ? 'bg-gradient-to-r from-white via-cyan-200 to-purple-200 bg-clip-text text-transparent' 
              : 'bg-gradient-to-r from-gray-900 via-cyan-700 to-purple-700 bg-clip-text text-transparent'
            }`}>
            {currentAd.title || 'Discover Amazing Offers'}
          </h3>
          
          <p className={`text-xs md:text-sm mb-2 md:mb-4 max-w-md
            ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Click to explore exclusive deals and premium content
          </p>
          
          <div className={`inline-flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 rounded-full font-semibold text-xs md:text-sm
            bg-gradient-to-r from-cyan-500 to-purple-600 text-white
            hover:from-cyan-400 hover:to-purple-500
            transform hover:scale-105 transition-all duration-300
            shadow-lg hover:shadow-cyan-500/25`}>
            <span>Learn More</span>
            <svg 
              className={`w-3 h-3 md:w-4 md:h-4 transition-transform duration-300 ${isHovered ? 'translate-x-1' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
        </div>

        <div className={`absolute top-2 right-2 text-xs px-2 py-0.5 rounded
          ${isDarkMode ? 'bg-black/50 text-gray-500' : 'bg-white/80 text-gray-400'}`}>
          Ad
        </div>
        
        {ads.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
            {ads.map((_, idx) => (
              <div 
                key={idx}
                className={`w-1.5 h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-cyan-400 w-3' : 'bg-gray-500/50'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export const StickyBottomBanner: React.FC = () => {
  const { getActiveAdsByPlacement } = useAds();
  const ads = getActiveAdsByPlacement('footer');
  
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const dismissed = sessionStorage.getItem('sticky_banner_dismissed');
    if (dismissed) {
      setIsDismissed(true);
      return;
    }
    const timer = setTimeout(() => setIsVisible(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (ads.length > 1 && isVisible && !isDismissed) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [ads.length, isVisible, isDismissed]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDismissed(true);
    setIsVisible(false);
    sessionStorage.setItem('sticky_banner_dismissed', 'true');
  };

  const handleClick = () => {
    const currentAd = ads[currentIndex];
    if (currentAd?.smartlinkUrl) {
      window.open(currentAd.smartlinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (isDismissed || !isVisible || ads.length === 0) {
    return null;
  }

  const currentAd = ads[currentIndex];
  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <div 
      className={`fixed bottom-0 left-0 right-0 z-50 p-3 md:hidden
        transition-transform duration-500 ease-out
        ${isVisible ? 'translate-y-0' : 'translate-y-full'}`}
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }}
    >
      <div 
        className={`relative mx-auto max-w-lg rounded-xl overflow-hidden cursor-pointer
          ${isDarkMode 
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/10' 
            : 'bg-gradient-to-r from-white via-gray-50 to-white border border-gray-200'
          }
          shadow-2xl`}
        onClick={handleClick}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-purple-500/10 to-cyan-500/5" />
        
        <div className="relative flex items-center justify-between p-3">
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-semibold truncate
                ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                {currentAd.title || 'Special Offer'}
              </p>
              <p className={`text-xs truncate
                ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                Tap to discover amazing deals
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-cyan-500 to-purple-600 text-white">
              View
            </span>
            <button
              onClick={handleDismiss}
              className={`p-1.5 rounded-full transition-colors
                ${isDarkMode 
                  ? 'hover:bg-white/10 text-gray-400' 
                  : 'hover:bg-gray-100 text-gray-500'
                }`}
              aria-label="Close banner"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className={`absolute top-1 left-1 text-[10px] px-1.5 py-0.5 rounded
          ${isDarkMode ? 'bg-black/50 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
          Ad
        </div>
      </div>
    </div>
  );
};

export const InArticleAd: React.FC<{ placement?: AdPlacement; className?: string }> = ({ 
  placement = 'article_middle', 
  className = '' 
}) => {
  const { getActiveAdsByPlacement } = useAds();
  const ads = getActiveAdsByPlacement(placement);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % ads.length);
      }, ROTATION_INTERVAL);
      return () => clearInterval(interval);
    }
  }, [ads.length]);

  const currentAd = ads[currentIndex];

  const handleClick = () => {
    if (currentAd?.smartlinkUrl) {
      window.open(currentAd.smartlinkUrl, '_blank', 'noopener,noreferrer');
    }
  };

  if (ads.length === 0) {
    return null;
  }

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <div 
      className={`relative my-6 p-4 rounded-lg cursor-pointer
        transition-all duration-300 hover:scale-[1.01]
        ${isDarkMode 
          ? 'bg-gradient-to-r from-gray-800/50 via-gray-900/50 to-gray-800/50 border border-white/5' 
          : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-100'
        }
        ${className}`}
      onClick={handleClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center
            ${isDarkMode ? 'bg-cyan-500/20 text-cyan-400' : 'bg-cyan-100 text-cyan-600'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </div>
          <div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {currentAd.title || 'Recommended for You'}
            </p>
            <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
              Sponsored Content
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium
          ${isDarkMode 
            ? 'bg-gradient-to-r from-cyan-500/20 to-purple-500/20 text-cyan-300 border border-cyan-500/30' 
            : 'bg-gradient-to-r from-cyan-50 to-purple-50 text-cyan-700 border border-cyan-200'
          }`}>
          Explore
        </span>
      </div>
    </div>
  );
};

export default AdBanner;
