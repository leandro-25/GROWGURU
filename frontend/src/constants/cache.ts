export const CACHE_DURATIONS = {
  SHORT: 30_000,
  MEDIUM: 120_000,
  LONG: 300_000,
  VERY_LONG: 600_000,
} as const;

export const CACHE_KEYS = {
  USER: 'cache:user',
  PORTFOLIO: 'cache:portfolio',
  TRANSACTIONS: 'cache:transactions',
  STRATEGIES: 'cache:strategies',
} as const;
