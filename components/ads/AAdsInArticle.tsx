import React, { useState, useEffect, useRef } from 'react';

interface AAdsInArticleProps {
  className?: string;
}

const AAdsInArticle: React.FC<AAdsInArticleProps> = ({ className = '' }) => {
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
      className={`my-8 ${className}`}
    >
      <div 
        className={`p-4 rounded-2xl ${
          isDarkMode 
            ? 'bg-gray-900/50 border border-gray-800' 
            : 'bg-gray-50 border border-gray-200'
        }`}
      >
        <div className="flex items-center justify-between mb-3">
          <span className={`text-xs font-medium ${
            isDarkMode ? 'text-gray-500' : 'text-gray-400'
          }`}>
            Sponsored Content
          </span>
        </div>
        
        <div
          className="relative overflow-hidden rounded-lg mx-auto"
          style={{
            width: '100%',
            maxWidth: dimensions.width,
            aspectRatio: `${dimensions.width}/${dimensions.height}`
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
              title="In-Article Advertisement"
              sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AAdsInArticle;
