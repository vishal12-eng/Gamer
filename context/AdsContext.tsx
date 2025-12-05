import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';

export type AdPlacement = 
  | 'home_top'
  | 'home_middle'
  | 'home_after_card_3'
  | 'article_top'
  | 'article_middle'
  | 'article_bottom'
  | 'category_top'
  | 'category_sidebar'
  | 'footer'
  | 'mobile_sticky';

export interface Ad {
  id: string;
  _id?: string;
  title: string;
  smartlinkUrl: string;
  imageUrl?: string;
  placement: AdPlacement;
  status: 'active' | 'inactive';
  priority?: number;
  impressions?: number;
  clicks?: number;
  createdAt: number | string;
  updatedAt: number | string;
}

interface AdsContextType {
  ads: Ad[];
  loading: boolean;
  error: string | null;
  isDbConnected: boolean;
  addAd: (ad: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateAd: (id: string, updates: Partial<Omit<Ad, 'id' | 'createdAt'>>) => Promise<void>;
  deleteAd: (id: string) => Promise<void>;
  toggleAdStatus: (id: string) => Promise<void>;
  getAdsByPlacement: (placement: AdPlacement) => Ad[];
  getActiveAdsByPlacement: (placement: AdPlacement) => Ad[];
  refreshAds: () => Promise<void>;
  recordImpression: (id: string) => void;
  recordClick: (id: string) => void;
}

const ADS_STORAGE_KEY = 'futuretechjournal_ads';
const API_BASE = '/api';

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

function normalizeAd(ad: any): Ad {
  return {
    id: ad._id || ad.id || generateId(),
    _id: ad._id,
    title: ad.title,
    smartlinkUrl: ad.smartlinkUrl,
    imageUrl: ad.imageUrl,
    placement: ad.placement,
    status: ad.status || 'active',
    priority: ad.priority || 0,
    impressions: ad.impressions || 0,
    clicks: ad.clicks || 0,
    createdAt: ad.createdAt || Date.now(),
    updatedAt: ad.updatedAt || Date.now(),
  };
}

export const AdsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDbConnected, setIsDbConnected] = useState(false);
  
  const adsRef = useRef<Ad[]>([]);
  adsRef.current = ads;

  const fetchAdsFromApi = useCallback(async (): Promise<{ ads: Ad[]; connected: boolean }> => {
    try {
      const response = await fetch(`${API_BASE}/ads`);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      if (data.ads && Array.isArray(data.ads)) {
        return { ads: data.ads.map(normalizeAd), connected: true };
      }
      return { ads: [], connected: true };
    } catch (e) {
      console.warn('[AdsContext] API fetch failed, using localStorage:', e);
      return { ads: [], connected: false };
    }
  }, []);

  const refreshAds = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { ads: apiAds, connected } = await fetchAdsFromApi();
      setIsDbConnected(connected);
      
      if (connected) {
        setAds(apiAds);
        if (apiAds.length > 0) {
          saveAdsToStorage(apiAds);
        }
        console.log(`[AdsContext] Loaded ${apiAds.length} ads from MongoDB`);
      } else {
        const localAds = loadAdsFromStorage();
        setAds(localAds);
        console.log(`[AdsContext] Loaded ${localAds.length} ads from localStorage`);
      }
    } catch (e: any) {
      setError(e.message);
      setIsDbConnected(false);
      const localAds = loadAdsFromStorage();
      setAds(localAds);
    } finally {
      setLoading(false);
    }
  }, [fetchAdsFromApi]);

  useEffect(() => {
    refreshAds();
  }, [refreshAds]);

  const addAd = useCallback(async (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = Date.now();
    const newAd: Ad = {
      ...adData,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    };

    if (isDbConnected) {
      try {
        const token = localStorage.getItem('auth_token');
        const response = await fetch(`${API_BASE}/ads`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(adData),
        });
        
        if (response.ok) {
          const savedAd = await response.json();
          const normalized = normalizeAd(savedAd);
          setAds(prev => {
            const updated = [...prev, normalized];
            saveAdsToStorage(updated);
            return updated;
          });
          console.log('[AdsContext] Ad saved to MongoDB');
          return;
        }
      } catch (e) {
        console.warn('[AdsContext] Failed to save to MongoDB, using localStorage:', e);
      }
    }
    
    setAds(prev => {
      const updated = [...prev, newAd];
      saveAdsToStorage(updated);
      return updated;
    });
  }, [isDbConnected]);

  const updateAd = useCallback(async (id: string, updates: Partial<Omit<Ad, 'id' | 'createdAt'>>) => {
    if (isDbConnected) {
      try {
        const token = localStorage.getItem('auth_token');
        const adToUpdate = adsRef.current.find(ad => ad.id === id || ad._id === id);
        const mongoId = adToUpdate?._id || id;
        
        const response = await fetch(`${API_BASE}/ads/${mongoId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
          body: JSON.stringify(updates),
        });
        
        if (response.ok) {
          const updatedAd = await response.json();
          const normalized = normalizeAd(updatedAd);
          setAds(prev => {
            const updated = prev.map(ad => 
              (ad.id === id || ad._id === id) ? normalized : ad
            );
            saveAdsToStorage(updated);
            return updated;
          });
          console.log('[AdsContext] Ad updated in MongoDB');
          return;
        }
      } catch (e) {
        console.warn('[AdsContext] Failed to update in MongoDB:', e);
      }
    }
    
    setAds(prev => {
      const updated = prev.map(ad => 
        ad.id === id 
          ? { ...ad, ...updates, updatedAt: Date.now() }
          : ad
      );
      saveAdsToStorage(updated);
      return updated;
    });
  }, [isDbConnected]);

  const deleteAd = useCallback(async (id: string) => {
    if (isDbConnected) {
      try {
        const token = localStorage.getItem('auth_token');
        const adToDelete = adsRef.current.find(ad => ad.id === id || ad._id === id);
        const mongoId = adToDelete?._id || id;
        
        const response = await fetch(`${API_BASE}/ads/${mongoId}`, {
          method: 'DELETE',
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        
        if (response.ok) {
          setAds(prev => {
            const updated = prev.filter(ad => ad.id !== id && ad._id !== id);
            saveAdsToStorage(updated);
            return updated;
          });
          console.log('[AdsContext] Ad deleted from MongoDB');
          return;
        }
      } catch (e) {
        console.warn('[AdsContext] Failed to delete from MongoDB:', e);
      }
    }
    
    setAds(prev => {
      const updated = prev.filter(ad => ad.id !== id);
      saveAdsToStorage(updated);
      return updated;
    });
  }, [isDbConnected]);

  const toggleAdStatus = useCallback(async (id: string) => {
    const ad = adsRef.current.find(a => a.id === id || a._id === id);
    if (!ad) return;
    
    const newStatus = ad.status === 'active' ? 'inactive' : 'active';
    await updateAd(id, { status: newStatus });
  }, [updateAd]);

  const getAdsByPlacement = useCallback((placement: AdPlacement): Ad[] => {
    return ads.filter(ad => ad.placement === placement);
  }, [ads]);

  const getActiveAdsByPlacement = useCallback((placement: AdPlacement): Ad[] => {
    return ads.filter(ad => ad.placement === placement && ad.status === 'active');
  }, [ads]);

  const recordImpression = useCallback((id: string) => {
    const adToTrack = adsRef.current.find(ad => ad.id === id || ad._id === id);
    const mongoId = adToTrack?._id || id;
    
    if (isDbConnected) {
      fetch(`${API_BASE}/ads/${mongoId}/impression`, { method: 'POST' }).catch(() => {});
    }
    
    setAds(prev => {
      const updated = prev.map(ad => 
        (ad.id === id || ad._id === id) 
          ? { ...ad, impressions: (ad.impressions || 0) + 1 }
          : ad
      );
      saveAdsToStorage(updated);
      return updated;
    });
  }, [isDbConnected]);

  const recordClick = useCallback((id: string) => {
    const adToTrack = adsRef.current.find(ad => ad.id === id || ad._id === id);
    const mongoId = adToTrack?._id || id;
    
    if (isDbConnected) {
      fetch(`${API_BASE}/ads/${mongoId}/click`, { method: 'POST' }).catch(() => {});
    }
    
    setAds(prev => {
      const updated = prev.map(ad => 
        (ad.id === id || ad._id === id) 
          ? { ...ad, clicks: (ad.clicks || 0) + 1 }
          : ad
      );
      saveAdsToStorage(updated);
      return updated;
    });
  }, [isDbConnected]);

  return (
    <AdsContext.Provider value={{
      ads,
      loading,
      error,
      isDbConnected,
      addAd,
      updateAd,
      deleteAd,
      toggleAdStatus,
      getAdsByPlacement,
      getActiveAdsByPlacement,
      refreshAds,
      recordImpression,
      recordClick,
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
