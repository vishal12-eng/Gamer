export type ExperimentName = 'placementTest' | 'sizeTest' | 'stickyTest' | 'refreshTest';

export interface Experiment {
  name: ExperimentName;
  variants: string[];
  weights?: number[];
}

export interface ABTestConfig {
  experiments: Experiment[];
  userIdCookieName?: string;
}

const EXPERIMENTS: Record<ExperimentName, Experiment> = {
  placementTest: {
    name: 'placementTest',
    variants: ['top', 'in-article', 'both'],
    weights: [0.33, 0.33, 0.34],
  },
  sizeTest: {
    name: 'sizeTest',
    variants: ['728x90', '970x90', '468x60'],
    weights: [0.5, 0.3, 0.2],
  },
  stickyTest: {
    name: 'stickyTest',
    variants: ['bottom', 'none', 'delayed'],
    weights: [0.6, 0.2, 0.2],
  },
  refreshTest: {
    name: 'refreshTest',
    variants: ['enabled', 'disabled'],
    weights: [0.5, 0.5],
  },
};

const USER_ID_COOKIE = 'ab_user';
const VARIANT_CACHE = new Map<ExperimentName, string>();

function simpleHash(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
  }
  return Math.abs(hash);
}

function getUserId(): string {
  if (typeof window === 'undefined') {
    return 'server-' + Math.random().toString(36).substring(2);
  }

  let userId: string | null = null;

  try {
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === USER_ID_COOKIE) {
        userId = value;
        break;
      }
    }
  } catch (e) {
    console.warn('[ABTest] Failed to read cookie:', e);
  }

  if (!userId) {
    try {
      userId = localStorage.getItem(USER_ID_COOKIE);
    } catch (e) {
      console.warn('[ABTest] Failed to read localStorage:', e);
    }
  }

  if (!userId) {
    userId = 'u-' + Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
    setUserId(userId);
  }

  return userId;
}

function setUserId(userId: string): void {
  if (typeof window === 'undefined') return;

  try {
    const expires = new Date();
    expires.setFullYear(expires.getFullYear() + 1);
    document.cookie = `${USER_ID_COOKIE}=${userId};expires=${expires.toUTCString()};path=/;SameSite=Lax`;
  } catch (e) {
    console.warn('[ABTest] Failed to set cookie:', e);
  }

  try {
    localStorage.setItem(USER_ID_COOKIE, userId);
  } catch (e) {
    console.warn('[ABTest] Failed to set localStorage:', e);
  }
}

function selectVariant(experiment: Experiment, userId: string): string {
  const hash = simpleHash(userId + experiment.name);
  const weights = experiment.weights || experiment.variants.map(() => 1 / experiment.variants.length);
  
  const normalizedHash = (hash % 1000) / 1000;
  
  let cumulativeWeight = 0;
  for (let i = 0; i < weights.length; i++) {
    cumulativeWeight += weights[i];
    if (normalizedHash < cumulativeWeight) {
      return experiment.variants[i];
    }
  }
  
  return experiment.variants[experiment.variants.length - 1];
}

export function getVariant(experimentName: ExperimentName): string {
  if (VARIANT_CACHE.has(experimentName)) {
    return VARIANT_CACHE.get(experimentName)!;
  }

  const experiment = EXPERIMENTS[experimentName];
  if (!experiment) {
    console.warn(`[ABTest] Unknown experiment: ${experimentName}`);
    return '';
  }

  const userId = getUserId();
  const variant = selectVariant(experiment, userId);
  
  VARIANT_CACHE.set(experimentName, variant);
  
  return variant;
}

export function getAllVariants(): Record<ExperimentName, string> {
  const variants: Record<string, string> = {};
  for (const experimentName of Object.keys(EXPERIMENTS) as ExperimentName[]) {
    variants[experimentName] = getVariant(experimentName);
  }
  return variants as Record<ExperimentName, string>;
}

export function forceVariant(experimentName: ExperimentName, variant: string): void {
  VARIANT_CACHE.set(experimentName, variant);
}

export function clearVariantCache(): void {
  VARIANT_CACHE.clear();
}

export function getExperimentInfo(experimentName: ExperimentName): Experiment | undefined {
  return EXPERIMENTS[experimentName];
}

export function isVariant(experimentName: ExperimentName, variant: string): boolean {
  return getVariant(experimentName) === variant;
}

export function getUserIdForAnalytics(): string {
  return getUserId();
}

export function getABTestContext(): {
  userId: string;
  variants: Record<ExperimentName, string>;
} {
  return {
    userId: getUserId(),
    variants: getAllVariants(),
  };
}
