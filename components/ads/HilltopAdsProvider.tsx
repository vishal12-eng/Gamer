import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface HilltopAdsContextType {
  isLoaded: boolean;
  hasError: boolean;
  zoneId: string;
  useFallback: boolean;
  nativeEnabled: boolean;
}

const HilltopAdsContext = createContext<HilltopAdsContextType>({
  isLoaded: false,
  hasError: false,
  zoneId: '',
  useFallback: true,
  nativeEnabled: false
});

interface HilltopAdsProviderProps {
  children: ReactNode;
}

declare global {
  interface Window {
    hilltopadsReady?: boolean;
    hilltopads?: {
      push: (config: unknown) => void;
      render?: (containerId: string) => void;
    };
  }
}

export const HilltopAdsProvider: React.FC<HilltopAdsProviderProps> = ({ 
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [useFallback, setUseFallback] = useState(true);
  
  const zoneId = import.meta.env.VITE_HILLTOPADS_ZONE_ID || '';
  const nativeEnabled = import.meta.env.VITE_HILLTOPADS_NATIVE_ENABLED === 'true';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!nativeEnabled) {
      if (process.env.NODE_ENV === 'development') {
        console.log('[HilltopAds] Native mode disabled, using fallback banners. Set VITE_HILLTOPADS_NATIVE_ENABLED=true to enable native ads.');
      }
      setUseFallback(true);
      setIsLoaded(true);
      return;
    }

    if (!zoneId) {
      console.warn('[HilltopAds] No zone ID configured, using fallback banners');
      setHasError(true);
      setUseFallback(true);
      setIsLoaded(true);
      return;
    }
    
    if (window.hilltopadsReady && window.hilltopads) {
      console.log('[HilltopAds] SDK already initialized');
      setIsLoaded(true);
      setUseFallback(false);
      return;
    }

    const existingScript = document.querySelector('script[data-hilltopads]');
    if (existingScript) {
      setIsLoaded(true);
      setUseFallback(window.hilltopads ? false : true);
      return;
    }

    console.log('[HilltopAds] Loading native SDK...');
    const script = document.createElement('script');
    script.src = `https://js.hilltopads.com/${zoneId}.js`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-hilltopads', 'true');
    
    const timeout = setTimeout(() => {
      if (!window.hilltopadsReady) {
        console.warn('[HilltopAds] Script load timeout, using fallback banners');
        setHasError(true);
        setUseFallback(true);
        setIsLoaded(true);
      }
    }, 5000);

    script.onload = () => {
      clearTimeout(timeout);
      if (window.hilltopads && typeof window.hilltopads.push === 'function') {
        window.hilltopadsReady = true;
        setIsLoaded(true);
        setUseFallback(false);
        console.log('[HilltopAds] Native SDK loaded successfully');
      } else {
        console.warn('[HilltopAds] SDK loaded but API not available, using fallback banners');
        setHasError(true);
        setUseFallback(true);
        setIsLoaded(true);
      }
    };

    script.onerror = () => {
      clearTimeout(timeout);
      console.warn('[HilltopAds] Script failed to load, using fallback banners');
      setHasError(true);
      setUseFallback(true);
      setIsLoaded(true);
    };

    document.head.appendChild(script);

    return () => {
      clearTimeout(timeout);
    };
  }, [zoneId, nativeEnabled]);

  return (
    <HilltopAdsContext.Provider value={{ isLoaded, hasError, zoneId, useFallback, nativeEnabled }}>
      {children}
    </HilltopAdsContext.Provider>
  );
};

export const useHilltopAds = () => useContext(HilltopAdsContext);

export default HilltopAdsProvider;
