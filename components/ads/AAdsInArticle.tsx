import React, { useState, useEffect, useRef } from 'react';

interface AAdsInArticleProps {
  className?: string;
}

const AAdsInArticle: React.FC<AAdsInArticleProps> = ({ className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const adUnitId = import.meta.env.VITE_AADS_AD_UNIT_ID || '';

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

  const size = '300x250';
  const dimensions = { width: 300, height: 250 };

  if (!adUnitId) {
    return null;
  }

  return (
    <div 
      ref={containerRef}
      id="article-content-ad"
      className={`my-8 flex justify-center ${className}`}
    >
      <div 
        className={`relative p-4 rounded-2xl ${
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
          className="relative overflow-hidden rounded-lg"
          style={{
            width: dimensions.width,
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
