import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface HilltopAdsContextType {
  isLoaded: boolean;
  hasError: boolean;
  zoneId: string;
}

const HilltopAdsContext = createContext<HilltopAdsContextType>({
  isLoaded: false,
  hasError: false,
  zoneId: ''
});

interface HilltopAdsProviderProps {
  children: ReactNode;
}

export const HilltopAdsProvider: React.FC<HilltopAdsProviderProps> = ({ 
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const zoneId = import.meta.env.VITE_HILLTOPADS_ZONE_ID || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!zoneId) {
      setHasError(true);
      return;
    }
    
    if ((window as any).hilltopadsLoaded) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[data-hilltopads]');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    (window as any).hilltopadsLoaded = true;
    setIsLoaded(true);

    return () => {};
  }, [zoneId]);

  return (
    <HilltopAdsContext.Provider value={{ isLoaded, hasError, zoneId }}>
      {children}
    </HilltopAdsContext.Provider>
  );
};

export const useHilltopAds = () => useContext(HilltopAdsContext);

export default HilltopAdsProvider;
