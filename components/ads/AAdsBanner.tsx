import React, { useState, useEffect, useRef } from 'react';

export interface AAdsBannerProps {
  size?: '728x90' | '468x60' | '320x50' | '320x100' | '300x250' | '336x280';
  className?: string;
  style?: React.CSSProperties;
  lazyLoad?: boolean;
}

const sizeMap: Record<string, { width: number; height: number }> = {
  '728x90': { width: 728, height: 90 },
  '468x60': { width: 468, height: 60 },
  '320x50': { width: 320, height: 50 },
  '320x100': { width: 320, height: 100 },
  '300x250': { width: 300, height: 250 },
  '336x280': { width: 336, height: 280 }
};

const AAdsBanner: React.FC<AAdsBannerProps> = ({
  size = '728x90',
  className = '',
  style,
  lazyLoad = true
}) => {
  const [isVisible, setIsVisible] = useState(!lazyLoad);
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
    if (!lazyLoad || !containerRef.current) {
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
  }, [lazyLoad]);

  const dimensions = sizeMap[size] || sizeMap['728x90'];
  const responsiveSize = isMobile ? '320x50' : size;
  const responsiveDimensions = isMobile ? sizeMap['320x50'] : dimensions;

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  if (!adUnitId) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`aads-banner-container relative overflow-hidden ${className}`}
      style={{
        width: '100%',
        maxWidth: responsiveDimensions.width,
        aspectRatio: `${responsiveDimensions.width}/${responsiveDimensions.height}`,
        margin: '0 auto',
        ...style
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
          src={`//ad.a-ads.com/${adUnitId}?size=${responsiveSize}`}
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
          title="Advertisement"
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
  );
};

export default AAdsBanner;
