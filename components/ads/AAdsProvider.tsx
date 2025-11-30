import React, { createContext, useContext, ReactNode, useMemo } from 'react';

interface AAdsConfig {
  adUnitId: string;
  isEnabled: boolean;
}

interface AAdsContextType {
  config: AAdsConfig;
  getAdUrl: (size?: string) => string;
}

const AAdsContext = createContext<AAdsContextType | null>(null);

interface AAdsProviderProps {
  children: ReactNode;
}

export const AAdsProvider: React.FC<AAdsProviderProps> = ({ children }) => {
  const config = useMemo<AAdsConfig>(() => ({
    adUnitId: import.meta.env.VITE_AADS_AD_UNIT_ID || '',
    isEnabled: Boolean(import.meta.env.VITE_AADS_AD_UNIT_ID)
  }), []);

  const getAdUrl = (size?: string): string => {
    if (!config.adUnitId) return '';
    const baseUrl = `https://a-ads.com/${config.adUnitId}`;
    return size ? `${baseUrl}?size=${size}` : baseUrl;
  };

  return (
    <AAdsContext.Provider value={{ config, getAdUrl }}>
      {children}
    </AAdsContext.Provider>
  );
};

export const useAAds = (): AAdsContextType => {
  const context = useContext(AAdsContext);
  if (!context) {
    return {
      config: { adUnitId: '', isEnabled: false },
      getAdUrl: () => ''
    };
  }
  return context;
};

export default AAdsProvider;
