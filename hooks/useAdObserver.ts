import { useEffect, useRef, useState, useCallback, RefObject } from 'react';
import { trackImpression, trackViewable, trackFallback } from '../lib/ads/analytics';

export interface UseAdObserverOptions {
  rootMargin?: string;
  threshold?: number;
  loadDelay?: number;
  fallbackTimeout?: number;
  placement?: string;
  size?: string;
  variant?: string;
  onVisible?: () => void;
  onHidden?: () => void;
  onFallback?: () => void;
  respectSaveData?: boolean;
}

export interface UseAdObserverResult {
  isVisible: boolean;
  isLoaded: boolean;
  showFallback: boolean;
  shouldRender: boolean;
  containerRef: RefObject<HTMLDivElement>;
  handleLoad: () => void;
  handleError: () => void;
}

const DEFAULT_OPTIONS: UseAdObserverOptions = {
  rootMargin: '200px',
  threshold: 0.1,
  loadDelay: 0,
  fallbackTimeout: 5000,
  respectSaveData: true,
};

function isSaveDataEnabled(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  const connection = (navigator as any).connection;
  if (connection) {
    if (connection.saveData) return true;
    if (connection.effectiveType && ['slow-2g', '2g'].includes(connection.effectiveType)) {
      return true;
    }
  }
  
  return false;
}

export function useAdObserver(options: UseAdObserverOptions = {}): UseAdObserverResult {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [isVisible, setIsVisible] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const [viewStartTime, setViewStartTime] = useState<number | null>(null);
  const [hasTrackedImpression, setHasTrackedImpression] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const visible = entry.isIntersecting;
        
        setIsVisible(visible);
        
        if (visible && !shouldRender) {
          if (opts.loadDelay && opts.loadDelay > 0) {
            setTimeout(() => setShouldRender(true), opts.loadDelay);
          } else {
            setShouldRender(true);
          }
          opts.onVisible?.();
        } else if (!visible && isVisible) {
          opts.onHidden?.();
        }

        if (visible && !viewStartTime) {
          setViewStartTime(Date.now());
        } else if (!visible && viewStartTime) {
          const duration = Date.now() - viewStartTime;
          if (duration >= 1000 && opts.placement) {
            trackViewable(opts.placement, duration);
          }
          setViewStartTime(null);
        }
      },
      {
        rootMargin: opts.rootMargin,
        threshold: opts.threshold,
      }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [opts.rootMargin, opts.threshold, opts.loadDelay, shouldRender, viewStartTime]);

  useEffect(() => {
    if (!shouldRender || isLoaded || showFallback) return;

    const timer = setTimeout(() => {
      if (!isLoaded) {
        setShowFallback(true);
        opts.onFallback?.();
        if (opts.placement) {
          trackFallback(opts.placement, 'timeout');
        }
      }
    }, opts.fallbackTimeout);

    return () => clearTimeout(timer);
  }, [shouldRender, isLoaded, opts.fallbackTimeout, showFallback]);

  const handleLoad = useCallback(() => {
    setIsLoaded(true);
    setShowFallback(false);
    
    if (!hasTrackedImpression && opts.placement) {
      trackImpression(opts.placement, opts.size, opts.variant);
      setHasTrackedImpression(true);
    }
  }, [hasTrackedImpression, opts.placement, opts.size, opts.variant]);

  const handleError = useCallback(() => {
    setShowFallback(true);
    opts.onFallback?.();
    if (opts.placement) {
      trackFallback(opts.placement, 'error');
    }
  }, [opts.placement]);

  const actualShouldRender = shouldRender && !(opts.respectSaveData && isSaveDataEnabled());

  return {
    isVisible,
    isLoaded,
    showFallback,
    shouldRender: actualShouldRender,
    containerRef: containerRef as RefObject<HTMLDivElement>,
    handleLoad,
    handleError,
  };
}

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

export function useLowBandwidth(): boolean {
  const [isLowBandwidth, setIsLowBandwidth] = useState(false);

  useEffect(() => {
    const check = () => {
      const connection = (navigator as any).connection;
      if (connection) {
        const isLow = connection.saveData || 
          ['slow-2g', '2g', '3g'].includes(connection.effectiveType);
        setIsLowBandwidth(isLow);
      }
    };

    check();
    
    const connection = (navigator as any).connection;
    if (connection) {
      connection.addEventListener('change', check);
      return () => connection.removeEventListener('change', check);
    }
  }, []);

  return isLowBandwidth;
}
