import React, { useState, useEffect, useCallback } from 'react';
import { trackConsentChange } from '../lib/ads/analytics';

export interface ConsentPreferences {
  necessary: boolean;
  analytics: boolean;
  advertising: boolean;
}

interface ConsentState {
  hasConsented: boolean;
  preferences: ConsentPreferences;
  timestamp: number;
}

const CONSENT_STORAGE_KEY = 'ads_consent';
const PREFERENCES_STORAGE_KEY = 'ads_preferences';
const DEFAULT_PREFERENCES: ConsentPreferences = {
  necessary: true,
  analytics: false,
  advertising: false,
};

function getStoredConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null;
  
  try {
    const stored = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.warn('[Consent] Failed to read consent:', e);
  }
  return null;
}

function saveConsent(state: ConsentState): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(state));
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(state.preferences));
  } catch (e) {
    console.warn('[Consent] Failed to save consent:', e);
  }
}

export function getConsentPreferences(): ConsentPreferences {
  const stored = getStoredConsent();
  return stored?.preferences || DEFAULT_PREFERENCES;
}

export function hasUserConsented(): boolean {
  const stored = getStoredConsent();
  return stored?.hasConsented || false;
}

export function canShowAds(): boolean {
  const stored = getStoredConsent();
  if (!stored?.hasConsented) return true;
  return stored.preferences.advertising !== false;
}

export function hasConsentDecision(): boolean {
  const stored = getStoredConsent();
  return stored?.hasConsented || false;
}

interface ConsentBannerProps {
  onConsentChange?: (preferences: ConsentPreferences) => void;
}

const ConsentBanner: React.FC<ConsentBannerProps> = ({ onConsentChange }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [preferences, setPreferences] = useState<ConsentPreferences>(DEFAULT_PREFERENCES);

  useEffect(() => {
    const stored = getStoredConsent();
    if (!stored) {
      const timer = setTimeout(() => setIsVisible(true), 1000);
      return () => clearTimeout(timer);
    } else {
      setPreferences(stored.preferences);
    }
  }, []);

  const handleAcceptAll = useCallback(() => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: true,
      advertising: true,
    };
    
    const state: ConsentState = {
      hasConsented: true,
      preferences: newPreferences,
      timestamp: Date.now(),
    };
    
    saveConsent(state);
    setPreferences(newPreferences);
    setIsVisible(false);
    onConsentChange?.(newPreferences);
    trackConsentChange(true, newPreferences);
  }, [onConsentChange]);

  const handleRejectAll = useCallback(() => {
    const newPreferences: ConsentPreferences = {
      necessary: true,
      analytics: false,
      advertising: false,
    };
    
    const state: ConsentState = {
      hasConsented: true,
      preferences: newPreferences,
      timestamp: Date.now(),
    };
    
    saveConsent(state);
    setPreferences(newPreferences);
    setIsVisible(false);
    onConsentChange?.(newPreferences);
    trackConsentChange(false, newPreferences);
  }, [onConsentChange]);

  const handleSavePreferences = useCallback(() => {
    const state: ConsentState = {
      hasConsented: true,
      preferences,
      timestamp: Date.now(),
    };
    
    saveConsent(state);
    setIsVisible(false);
    setShowPreferences(false);
    onConsentChange?.(preferences);
    trackConsentChange(preferences.advertising, preferences);
  }, [preferences, onConsentChange]);

  const togglePreference = (key: keyof ConsentPreferences) => {
    if (key === 'necessary') return;
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  if (!isVisible) return null;

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 z-[60] p-4"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 16px)' }}
    >
      <div 
        className={`max-w-4xl mx-auto rounded-xl shadow-2xl ${
          isDarkMode 
            ? 'bg-gray-900 border border-gray-700' 
            : 'bg-white border border-gray-200'
        }`}
        style={{ backdropFilter: 'blur(12px)' }}
      >
        {!showPreferences ? (
          <div className="p-4 md:p-6">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 text-2xl">🍪</div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold mb-2 ${
                  isDarkMode ? 'text-white' : 'text-gray-900'
                }`}>
                  We value your privacy
                </h3>
                <p className={`text-sm mb-4 ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-600'
                }`}>
                  We use cookies to enhance your browsing experience and analyze our traffic. 
                  Our ads are provided by A-ADS, a privacy-respecting ad network that doesn't use 
                  tracking cookies. You can choose your preferences below.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={handleAcceptAll}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={handleRejectAll}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 text-white hover:bg-gray-600' 
                        : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                    }`}
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => setShowPreferences(true)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isDarkMode 
                        ? 'text-gray-300 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Manage Preferences
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 md:p-6">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              Cookie Preferences
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Necessary Cookies
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Required for the website to function properly
                    </p>
                  </div>
                  <div className="w-12 h-6 bg-blue-600 rounded-full flex items-center justify-end px-1">
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Analytics Cookies
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Help us understand how visitors interact with our website
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('analytics')}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.analytics 
                        ? 'bg-blue-600 justify-end' 
                        : isDarkMode ? 'bg-gray-600 justify-start' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
              
              <div className={`p-4 rounded-lg ${
                isDarkMode ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className={`font-medium ${
                      isDarkMode ? 'text-white' : 'text-gray-900'
                    }`}>
                      Advertising
                    </h4>
                    <p className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      Privacy-friendly ads via A-ADS (no tracking cookies used)
                    </p>
                  </div>
                  <button
                    onClick={() => togglePreference('advertising')}
                    className={`w-12 h-6 rounded-full flex items-center px-1 transition-colors ${
                      preferences.advertising 
                        ? 'bg-blue-600 justify-end' 
                        : isDarkMode ? 'bg-gray-600 justify-start' : 'bg-gray-300 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 bg-white rounded-full" />
                  </button>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleSavePreferences}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Preferences
              </button>
              <button
                onClick={() => setShowPreferences(false)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isDarkMode 
                    ? 'text-gray-300 hover:text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AdPreferencesLink: React.FC = () => {
  const [showBanner, setShowBanner] = useState(false);

  const isDarkMode = typeof document !== 'undefined' && 
    document.documentElement.classList.contains('dark');

  return (
    <>
      <button
        onClick={() => setShowBanner(true)}
        className={`text-sm hover:underline ${
          isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        Ad Preferences
      </button>
      {showBanner && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-end justify-center">
          <ConsentBanner onConsentChange={() => setShowBanner(false)} />
        </div>
      )}
    </>
  );
};

export default ConsentBanner;
