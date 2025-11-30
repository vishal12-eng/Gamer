import React, { useEffect, useState, createContext, useContext, ReactNode, useCallback } from 'react';

interface AdsterraContextType {
  isLoaded: boolean;
  hasError: boolean;
  smartLinkId: string;
  applySmartLinkToAllOutgoingLinks: () => void;
}

const AdsterraContext = createContext<AdsterraContextType>({
  isLoaded: false,
  hasError: false,
  smartLinkId: '',
  applySmartLinkToAllOutgoingLinks: () => {}
});

interface AdsterraProviderProps {
  children: ReactNode;
}

export const AdsterraProvider: React.FC<AdsterraProviderProps> = ({ 
  children
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  
  const smartLinkId = import.meta.env.VITE_ADSTERRA_SMARTLINK_ID || '';

  const applySmartLinkToAllOutgoingLinks = useCallback(() => {
    if (typeof window === 'undefined' || !smartLinkId) return;
    
    try {
      const links = document.querySelectorAll('a[href^="http"]:not([data-adsterra-applied])');
      links.forEach((link) => {
        const href = link.getAttribute('href');
        if (href && !href.includes(window.location.hostname) && !href.includes('adsterra')) {
          const originalHref = href;
          const smartLinkUrl = `https://www.profitablecpmrate.com/${smartLinkId}?url=${encodeURIComponent(originalHref)}`;
          link.setAttribute('data-original-href', originalHref);
          link.setAttribute('href', smartLinkUrl);
          link.setAttribute('data-adsterra-applied', 'true');
        }
      });
    } catch (error) {
      console.warn('[Adsterra] Failed to apply SmartLinks to outgoing links');
    }
  }, [smartLinkId]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!smartLinkId) {
      setHasError(true);
      return;
    }
    
    if ((window as any).adsterraLoaded) {
      setIsLoaded(true);
      return;
    }

    const existingScript = document.querySelector('script[data-adsterra]');
    if (existingScript) {
      setIsLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.profitablecpmrate.com/${smartLinkId}/invoke.js`;
    script.async = true;
    script.defer = true;
    script.setAttribute('data-adsterra', 'true');
    
    script.onload = () => {
      (window as any).adsterraLoaded = true;
      setIsLoaded(true);
      applySmartLinkToAllOutgoingLinks();
    };
    
    script.onerror = () => {
      setHasError(true);
    };

    document.head.appendChild(script);

    return () => {};
  }, [smartLinkId, applySmartLinkToAllOutgoingLinks]);

  useEffect(() => {
    if (isLoaded && smartLinkId) {
      const observer = new MutationObserver(() => {
        applySmartLinkToAllOutgoingLinks();
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }
  }, [isLoaded, smartLinkId, applySmartLinkToAllOutgoingLinks]);

  return (
    <AdsterraContext.Provider value={{ isLoaded, hasError, smartLinkId, applySmartLinkToAllOutgoingLinks }}>
      {children}
    </AdsterraContext.Provider>
  );
};

export const useAdsterra = () => useContext(AdsterraContext);

export default AdsterraProvider;
