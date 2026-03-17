type CacheKey = string;
type CacheEntry = { data: unknown; expiresAt: number };

interface CacheStrategy {
  ttl: number;
}

const CACHE_STRATEGIES: Record<string, CacheStrategy> = {
  USER_DATA: { ttl: 60_000 },
  TRANSACTIONS: { ttl: 30_000 },
  CARTEIRA: { ttl: 120_000 },
  ESTRATEGIAS: { ttl: 300_000 },
  PORTFOLIO_DETAILS: { ttl: 60_000 },
};

export class CacheService {
  private cache = new Map<CacheKey, CacheEntry>();

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (entry.expiresAt < Date.now()) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  set(key: string, data: unknown, ttl: number): void {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  invalidate(pattern: RegExp): void {
    for (const key of this.cache.keys()) {
      if (pattern.test(key)) {
        this.cache.delete(key);
      }
    }
  }

  clear(): void {
    this.cache.clear();
  }
}

export const cacheService = new CacheService();

export const getCacheTTL = (strategyName: string): number => {
  return CACHE_STRATEGIES[strategyName]?.ttl || 60_000;
};

export const CACHE_KEYS = {
  USER_DATA: 'USER_DATA',
  TRANSACTIONS: 'TRANSACTIONS',
  CARTEIRA: 'CARTEIRA',
  ESTRATEGIAS: 'ESTRATEGIAS',
  PORTFOLIO_DETAILS: 'PORTFOLIO_DETAILS',
} as const;
