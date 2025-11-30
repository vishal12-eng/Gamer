import React, { useState, useEffect, useRef } from 'react';

interface AAdsFeedProps {
  className?: string;
}

const AAdsFeed: React.FC<AAdsFeedProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const adUnitId = import.meta.env.VITE_AADS_AD_UNIT_ID || '';

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const size = isMobile ? '320x100' : '728x90';
  const dimensions = isMobile 
    ? { width: 320, height: 100 } 
    : { width: 728, height: 90 };

  if (!adUnitId) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      className={`col-span-1 md:col-span-2 lg:col-span-3 ${className}`}
    >
      <div 
        className={`relative overflow-hidden rounded-2xl p-6 ${
          isDarkMode 
            ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-gray-800' 
            : 'bg-gradient-to-r from-gray-50 via-white to-gray-50 border border-gray-200'
        }`}
      >
        <div 
          className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-cyan-500 via-purple-500 to-cyan-500" 
        />
        
        <div className="flex flex-col lg:flex-row items-center gap-6">
          <div className="flex-shrink-0 lg:w-1/3">
            <p className={`text-xs uppercase tracking-wider mb-2 ${
              isDarkMode ? 'text-cyan-400' : 'text-cyan-600'
            }`}>
              Featured Partner
            </p>
            <h3 className={`text-xl font-bold mb-2 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Discover Amazing Deals
            </h3>
            <p className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Explore curated products from our trusted partners
            </p>
          </div>
          
          <div className="flex-grow w-full lg:w-2/3 flex justify-center">
            <div
              className="relative overflow-hidden rounded-lg"
              style={{
                width: '100%',
                maxWidth: dimensions.width,
                aspectRatio: `${dimensions.width}/${dimensions.height}`
              }}
            >
              {!isLoaded && (
                <div 
                  className={`absolute inset-0 animate-pulse rounded-lg ${
                    isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                  }`}
                />
              )}
              
              {isVisible && (
                <iframe
                  data-aa={adUnitId}
                  src={`//ad.a-ads.com/${adUnitId}?size=${size}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    border: 'none',
                    padding: 0,
                    overflow: 'hidden',
                    backgroundColor: 'transparent'
                  }}
                  loading="lazy"
                  onLoad={() => setIsLoaded(true)}
                  title="Feed Advertisement"
                  sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
                />
              )}
            </div>
          </div>
        </div>
        
        <div 
          className={`absolute top-3 right-3 px-1.5 py-0.5 rounded text-[9px] font-medium ${
            isDarkMode 
              ? 'bg-gray-800/80 text-gray-500' 
              : 'bg-gray-200/80 text-gray-500'
          }`}
        >
          Ad
        </div>
      </div>
    </div>
  );
};

export default AAdsFeed;
