import React, { useState, useEffect } from 'react';
import { trackClose, trackImpression } from '../../lib/ads/analytics';
import { getVariant } from '../../lib/ads/abtest';
import { canShowAds } from '../ConsentBanner';

const STORAGE_KEY = 'aads_sticky_banner_closed';
const CLOSE_DURATION_MS = 24 * 60 * 60 * 1000;

const StickyAAdsBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClosed, setIsClosed] = useState(true);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);
  const adUnitId = import.meta.env.VITE_AADS_AD_UNIT_ID || '';
  const stickyVariant = getVariant('stickyTest');

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (stickyVariant === 'none') {
      setIsClosed(true);
      return;
    }

    const delay = stickyVariant === 'delayed' ? 5000 : 1500;

    try {
      const closedAt = localStorage.getItem(STORAGE_KEY);
      if (closedAt) {
        const closedTime = parseInt(closedAt, 10);
        if (Date.now() - closedTime < CLOSE_DURATION_MS) {
          setIsClosed(true);
          return;
        }
      }
      const timer = setTimeout(() => {
        setIsClosed(false);
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    } catch (e) {
      const timer = setTimeout(() => {
        setIsClosed(false);
        setIsVisible(true);
      }, delay);
      return () => clearTimeout(timer);
    }
  }, [stickyVariant]);

  const handleClose = () => {
    setIsClosed(true);
    trackClose('sticky-banner');
    try {
      localStorage.setItem(STORAGE_KEY, Date.now().toString());
    } catch (e) {
      console.error('Failed to save banner close state');
    }
  };

  const handleLoad = () => {
    setIsLoaded(true);
    if (!hasTrackedImpression) {
      trackImpression('sticky-banner', isMobile ? '320x50' : '728x90', stickyVariant);
      setHasTrackedImpression(true);
    }
  };

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  const size = isMobile ? '320x50' : '728x90';
  const dimensions = isMobile 
    ? { width: 320, height: 50 } 
    : { width: 728, height: 90 };

  if (!adUnitId || isClosed || !canShowAds()) {
    return null;
  }

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 flex justify-center items-center transition-transform duration-300 ${
        isVisible ? 'translate-y-0' : 'translate-y-full'
      }`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div
        className={`relative p-2 rounded-t-xl shadow-2xl ${
          isDarkMode 
            ? 'bg-gray-900/95 border-t border-x border-gray-700' 
            : 'bg-white/95 border-t border-x border-gray-200'
        }`}
        style={{
          maxWidth: dimensions.width + 48,
          backdropFilter: 'blur(8px)',
        }}
      >
        <button
          onClick={handleClose}
          className={`absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition-colors z-50 shadow-lg ${
            isDarkMode 
              ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-600' 
              : 'bg-gray-100 hover:bg-gray-200 text-gray-800 border border-gray-300'
          }`}
          aria-label="Close advertisement"
        >
          ×
        </button>

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
            title="Sticky Banner Advertisement"
            sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox"
          />
        </div>
        
        <div 
          className={`absolute top-3 left-3 px-1.5 py-0.5 rounded text-[9px] font-medium ${
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

export default StickyAAdsBanner;
