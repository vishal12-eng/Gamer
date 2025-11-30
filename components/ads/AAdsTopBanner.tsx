import React, { useState, useEffect, useRef } from 'react';

const AAdsTopBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
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
    if (!containerRef.current) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '100px', threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const size = isMobile ? '320x50' : '728x90';
  const dimensions = isMobile 
    ? { width: 320, height: 50 } 
    : { width: 728, height: 90 };

  if (!adUnitId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`aads-top-banner-container w-full flex justify-center ${className}`}
      style={{
        minHeight: dimensions.height,
      }}
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: '100%',
          maxWidth: dimensions.width,
          height: dimensions.height,
        }}
      >
        {!isLoaded && (
          <div 
            className={`absolute inset-0 animate-pulse rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        )}
        
        {isVisible && (
          <iframe
            data-aa={adUnitId}
            src={`https://ad.a-ads.com/${adUnitId}?size=${size}`}
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
            title="Top Banner Advertisement"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          />
        )}
        
        <div 
          className={`absolute top-1 right-1 px-1.5 py-0.5 rounded text-[9px] font-medium z-10 ${
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

export default AAdsTopBanner;
