import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';

export type AdPlacement = 
  | 'home_top'
  | 'home_middle'
  | 'home_after_card_3'
  | 'article_top'
  | 'article_middle'
  | 'article_bottom'
  | 'footer';

export interface Ad {
  id: string;
  title: string;
  smartlinkUrl: string;
  imageUrl?: string;
  placement: AdPlacement;
  status: 'active' | 'inactive';
  createdAt: number;
  updatedAt: number;
}

interface AdsContextType {
  ads: Ad[];
  addAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAd: (id: string, updates: Partial<Omit<Ad, 'id' | 'createdAt'>>) => void;
  deleteAd: (id: string) => void;
  toggleAdStatus: (id: string) => void;
  getAdsByPlacement: (placement: AdPlacement) => Ad[];
  getActiveAdsByPlacement: (placement: AdPlacement) => Ad[];
}

const ADS_STORAGE_KEY = 'futuretechjournal_ads';

const AdsContext = createContext<AdsContextType | undefined>(undefined);

function generateId(): string {
  return `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function loadAdsFromStorage(): Ad[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(ADS_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('[AdsContext] Failed to load ads from storage:', e);
  }
  return [];
}

function saveAdsToStorage(ads: Ad[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(ads));
  } catch (e) {
    console.error('[AdsContext] Failed to save ads to storage:', e);
  }
}

export const AdsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);

  useEffect(() => {
    const loadedAds = loadAdsFromStorage();
    setAds(loadedAds);
  }, []);

  useEffect(() => {
    if (ads.length > 0 || loadAdsFromStorage().length > 0) {
      saveAdsToStorage(ads);
    }
  }, [ads]);

  const addAd = useCallback((adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newAd: Ad = {
      ...adData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };
    setAds(prev => [...prev, newAd]);
  }, []);

  const updateAd = useCallback((id: string, updates: Partial<Omit<Ad, 'id' | 'createdAt'>>) => {
    setAds(prev => prev.map(ad => 
      ad.id === id 
        ? { ...ad, ...updates, updatedAt: Date.now() }
        : ad
    ));
  }, []);

  const deleteAd = useCallback((id: string) => {
    setAds(prev => prev.filter(ad => ad.id !== id));
  }, []);

  const toggleAdStatus = useCallback((id: string) => {
    setAds(prev => prev.map(ad =>
      ad.id === id
        ? { ...ad, status: ad.status === 'active' ? 'inactive' : 'active', updatedAt: Date.now() }
        : ad
    ));
  }, []);

  const getAdsByPlacement = useCallback((placement: AdPlacement): Ad[] => {
    return ads.filter(ad => ad.placement === placement);
  }, [ads]);

  const getActiveAdsByPlacement = useCallback((placement: AdPlacement): Ad[] => {
    return ads.filter(ad => ad.placement === placement && ad.status === 'active');
  }, [ads]);

  return (
    <AdsContext.Provider value={{
      ads,
      addAd,
      updateAd,
      deleteAd,
      toggleAdStatus,
      getAdsByPlacement,
      getActiveAdsByPlacement,
    }}>
      {children}
    </AdsContext.Provider>
  );
};

export const useAds = (): AdsContextType => {
  const context = useContext(AdsContext);
  if (!context) {
    throw new Error('useAds must be used within an AdsProvider');
  }
  return context;
};

export const useAdsForPlacement = (placement: AdPlacement): Ad[] => {
  const { getActiveAdsByPlacement } = useAds();
  return getActiveAdsByPlacement(placement);
};
