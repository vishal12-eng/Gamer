export type AdEventType = 
  | 'ad_impression'
  | 'ad_click'
  | 'ad_refresh'
  | 'ad_close'
  | 'ad_fallback'
  | 'ad_viewable'
  | 'ad_hidden'
  | 'ad_error'
  | 'consent_change';

export interface AdEvent {
  type: AdEventType;
  timestamp: number;
  placement: string;
  size?: string;
  variant?: string;
  viewDuration?: number;
  metadata?: Record<string, unknown>;
}

interface AnalyticsConfig {
  batchSize: number;
  flushInterval: number;
  endpoint: string;
  enabled: boolean;
  debug: boolean;
}

const DEFAULT_CONFIG: AnalyticsConfig = {
  batchSize: 10,
  flushInterval: 30000,
  endpoint: '/api/ads/event',
  enabled: true,
  debug: false,
};

let config: AnalyticsConfig = { ...DEFAULT_CONFIG };
let eventQueue: AdEvent[] = [];
let flushTimer: NodeJS.Timeout | null = null;
let isInitialized = false;

function getSessionId(): string {
  if (typeof window === 'undefined') return 'server';
  
  let sessionId = sessionStorage.getItem('ads_session_id');
  if (!sessionId) {
    sessionId = 'session-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 7);
    sessionStorage.setItem('ads_session_id', sessionId);
  }
  return sessionId;
}

function getPageContext(): Record<string, unknown> {
  if (typeof window === 'undefined') return {};
  
  return {
    url: window.location.pathname,
    referrer: document.referrer || null,
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight,
    },
    userAgent: navigator.userAgent,
    timestamp: Date.now(),
  };
}

export function initAnalytics(customConfig: Partial<AnalyticsConfig> = {}): void {
  config = { ...DEFAULT_CONFIG, ...customConfig };
  isInitialized = true;
  
  if (typeof window !== 'undefined' && config.enabled) {
    startFlushTimer();
    
    window.addEventListener('beforeunload', () => {
      flushEvents(true);
    });
    
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        flushEvents(true);
      }
    });
  }
  
  if (config.debug) {
    console.log('[AdAnalytics] Initialized with config:', config);
  }
}

function startFlushTimer(): void {
  if (flushTimer) {
    clearInterval(flushTimer);
  }
  
  flushTimer = setInterval(() => {
    if (eventQueue.length > 0) {
      flushEvents();
    }
  }, config.flushInterval);
}

export function trackEvent(
  type: AdEventType,
  placement: string,
  data: Partial<Omit<AdEvent, 'type' | 'timestamp' | 'placement'>> = {}
): void {
  if (!config.enabled) return;
  
  const event: AdEvent = {
    type,
    timestamp: Date.now(),
    placement,
    ...data,
  };
  
  eventQueue.push(event);
  
  if (config.debug) {
    console.log('[AdAnalytics] Event tracked:', event);
  }
  
  if (eventQueue.length >= config.batchSize) {
    flushEvents();
  }
}

export async function flushEvents(sync: boolean = false): Promise<void> {
  if (eventQueue.length === 0) return;
  
  const events = [...eventQueue];
  eventQueue = [];
  
  const payload = {
    sessionId: getSessionId(),
    context: getPageContext(),
    events,
  };
  
  if (config.debug) {
    console.log('[AdAnalytics] Flushing events:', payload);
  }
  
  try {
    if (sync && typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
      const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
      navigator.sendBeacon(config.endpoint, blob);
    } else {
      const response = await fetch(config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        keepalive: sync,
      });
      
      if (!response.ok && config.debug) {
        console.error('[AdAnalytics] Failed to send events:', response.status);
      }
    }
  } catch (error) {
    if (config.debug) {
      console.error('[AdAnalytics] Error sending events:', error);
    }
    eventQueue.unshift(...events);
  }
}

export function trackImpression(placement: string, size?: string, variant?: string): void {
  trackEvent('ad_impression', placement, { size, variant });
}

export function trackClick(placement: string, size?: string, variant?: string): void {
  trackEvent('ad_click', placement, { size, variant });
}

export function trackRefresh(placement: string): void {
  trackEvent('ad_refresh', placement);
}

export function trackClose(placement: string): void {
  trackEvent('ad_close', placement);
}

export function trackViewable(placement: string, viewDuration: number): void {
  trackEvent('ad_viewable', placement, { viewDuration });
}

export function trackFallback(placement: string, reason: string): void {
  trackEvent('ad_fallback', placement, { metadata: { reason } });
}

export function trackConsentChange(accepted: boolean, preferences?: { necessary: boolean; analytics: boolean; advertising: boolean }): void {
  trackEvent('consent_change', 'global', { 
    metadata: { accepted, preferences } 
  });
}

export function getQueuedEvents(): AdEvent[] {
  return [...eventQueue];
}

export function clearQueue(): void {
  eventQueue = [];
}

export function isAnalyticsEnabled(): boolean {
  return config.enabled;
}

export function setAnalyticsEnabled(enabled: boolean): void {
  config.enabled = enabled;
  if (!enabled && flushTimer) {
    clearInterval(flushTimer);
    flushTimer = null;
  } else if (enabled && !flushTimer) {
    startFlushTimer();
  }
}

if (!isInitialized && typeof window !== 'undefined') {
  initAnalytics();
}
