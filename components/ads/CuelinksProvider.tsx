import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react';

interface CuelinksContextType {
  isLoaded: boolean;
  hasError: boolean;
  smartLinkId: string;
}

const CuelinksContext = createContext<CuelinksContextType>({
  isLoaded: false,
  hasError: false,
  smartLinkId: ''
});

interface CuelinksProviderProps {
  children: ReactNode;
}

export const CuelinksProvider: React.FC<CuelinksProviderProps> = ({ 
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const smartLinkId = import.meta.env.VITE_CUELINKS_SMARTLINK_ID || '';

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!smartLinkId) {
      console.log('[Cuelinks] No SmartLink ID configured - ads will use fallback mode');
      setHasError(true);
      return;
    }
    
    if ((window as any).cuelinksLoaded) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[data-cuelinks]');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.cuelinks.com/smartlink_api.js?id=${smartLinkId}`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-cuelinks', 'true');
    
    script.onload = () => {
      (window as any).cuelinksLoaded = true;
      setIsLoaded(true);
      console.log('[Cuelinks] SmartLink script loaded successfully');
    };
    
    script.onerror = () => {
      setHasError(true);
      console.warn('[Cuelinks] Failed to load SmartLink script - using fallback');
    };

    document.head.appendChild(script);

    return () => {
    };
  }, [smartLinkId]);

  return (
    <CuelinksContext.Provider value={{ isLoaded, hasError, smartLinkId }}>
      {children}
    </CuelinksContext.Provider>
  );
};

export const useCuelinks = () => useContext(CuelinksContext);

export default CuelinksProvider;
