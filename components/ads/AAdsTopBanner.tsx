import React, { useState, useEffect } from 'react';
import { useAdObserver } from '../../hooks/useAdObserver';
import { getVariant } from '../../lib/ads/abtest';
import { canShowAds } from '../ConsentBanner';
import AdFallback from './AdFallback';

const AAdsTopBanner: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [isMobile, setIsMobile] = useState(false);
  const adUnitId = import.meta.env.VITE_AADS_AD_UNIT_ID || '';
  
  const size = isMobile ? '320x50' : '728x90';
  const dimensions = isMobile 
    ? { width: 320, height: 50 } 
    : { width: 728, height: 90 };

  const {
    isLoaded,
    showFallback,
    shouldRender,
    containerRef,
    handleLoad,
    handleError,
  } = useAdObserver({
    placement: 'top-banner',
    size,
    variant: getVariant('sizeTest'),
    fallbackTimeout: 5000,
  });

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  if (!adUnitId || !canShowAds()) {
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
        {!isLoaded && !showFallback && (
          <div 
            className={`absolute inset-0 animate-pulse rounded-lg ${
              isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
            }`}
          />
        )}
        
        {showFallback ? (
          <AdFallback width={dimensions.width} height={dimensions.height} type="newsletter" />
        ) : shouldRender && (
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
            onLoad={handleLoad}
            onError={handleError}
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
