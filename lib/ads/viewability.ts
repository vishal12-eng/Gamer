export interface ViewabilityOptions {
  threshold?: number;
  requiredTime?: number;
  onViewable?: (element: HTMLElement) => void;
  onHidden?: (element: HTMLElement) => void;
}

interface ViewabilityState {
  isViewable: boolean;
  viewStartTime: number | null;
  hasReportedViewable: boolean;
  lastRefreshTime: number;
}

const MIN_REFRESH_INTERVAL = 30000;
const DEFAULT_VIEWABILITY_THRESHOLD = 0.5;
const DEFAULT_REQUIRED_TIME = 1000;

const elementStates = new WeakMap<HTMLElement, ViewabilityState>();
const observers = new WeakMap<HTMLElement, IntersectionObserver>();
const timers = new WeakMap<HTMLElement, NodeJS.Timeout>();

function getState(element: HTMLElement): ViewabilityState {
  if (!elementStates.has(element)) {
    elementStates.set(element, {
      isViewable: false,
      viewStartTime: null,
      hasReportedViewable: false,
      lastRefreshTime: 0,
    });
  }
  return elementStates.get(element)!;
}

export function observeAd(
  element: HTMLElement | null,
  callback: (isViewable: boolean, viewDuration: number) => void,
  options: ViewabilityOptions = {}
): () => void {
  if (!element) return () => {};

  const {
    threshold = DEFAULT_VIEWABILITY_THRESHOLD,
    requiredTime = DEFAULT_REQUIRED_TIME,
    onViewable,
    onHidden,
  } = options;

  const state = getState(element);

  const observer = new IntersectionObserver(
    (entries) => {
      const entry = entries[0];
      const isVisible = entry.isIntersecting && entry.intersectionRatio >= threshold;

      if (isVisible && !state.isViewable) {
        state.isViewable = true;
        state.viewStartTime = Date.now();

        const timer = setTimeout(() => {
          if (state.isViewable && state.viewStartTime) {
            const duration = Date.now() - state.viewStartTime;
            if (duration >= requiredTime && !state.hasReportedViewable) {
              state.hasReportedViewable = true;
              callback(true, duration);
              onViewable?.(element);
            }
          }
        }, requiredTime);

        timers.set(element, timer);
      } else if (!isVisible && state.isViewable) {
        state.isViewable = false;
        const timer = timers.get(element);
        if (timer) {
          clearTimeout(timer);
          timers.delete(element);
        }

        if (state.viewStartTime) {
          const duration = Date.now() - state.viewStartTime;
          callback(false, duration);
          onHidden?.(element);
        }

        state.viewStartTime = null;
      }
    },
    {
      threshold: [0, 0.25, 0.5, 0.75, 1.0],
      rootMargin: '0px',
    }
  );

  observer.observe(element);
  observers.set(element, observer);

  return () => {
    observer.disconnect();
    observers.delete(element);
    const timer = timers.get(element);
    if (timer) {
      clearTimeout(timer);
      timers.delete(element);
    }
    elementStates.delete(element);
  };
}

export function canRefreshAd(element: HTMLElement): boolean {
  const state = getState(element);
  const now = Date.now();
  
  if (now - state.lastRefreshTime < MIN_REFRESH_INTERVAL) {
    return false;
  }
  
  const isClosed = element.closest('[data-closed="true"]');
  if (isClosed) {
    return false;
  }

  return true;
}

export function refreshAd(element: HTMLElement): boolean {
  if (!canRefreshAd(element)) {
    return false;
  }

  const state = getState(element);
  const iframe = element.querySelector('iframe');
  
  if (iframe && iframe.src) {
    const currentSrc = iframe.src;
    iframe.src = '';
    
    requestAnimationFrame(() => {
      iframe.src = currentSrc;
    });

    state.lastRefreshTime = Date.now();
    state.hasReportedViewable = false;
    
    return true;
  }

  return false;
}

export function getViewabilityStats(element: HTMLElement): {
  isViewable: boolean;
  hasReportedViewable: boolean;
  lastRefreshTime: number;
  timeSinceLastRefresh: number;
} {
  const state = getState(element);
  return {
    isViewable: state.isViewable,
    hasReportedViewable: state.hasReportedViewable,
    lastRefreshTime: state.lastRefreshTime,
    timeSinceLastRefresh: Date.now() - state.lastRefreshTime,
  };
}

export function resetViewability(element: HTMLElement): void {
  const state = getState(element);
  state.hasReportedViewable = false;
  state.viewStartTime = null;
}
