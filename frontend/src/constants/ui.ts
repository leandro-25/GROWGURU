export const UI_CONSTANTS = {
  TRANSACTIONS_PER_PAGE: 50,
  MAX_VISIBLE_TRANSACTIONS: 4,
  CHART_COLORS: [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#C9CB3F',
    '#FF6F61',
    '#6B7280',
    '#34D399',
    '#F472B6',
    '#10B981',
    '#60A5FA',
    '#FBBF24',
    '#EC4899',
    '#4ADE80',
    '#F87171',
    '#38BDF8',
    '#A78BFA',
    '#FCD34D',
  ],
  SCROLL_THRESHOLD: 50,
  DEBOUNCE_DELAY: 300,
} as const;

export const STORAGE_KEYS = {
  TOKEN: 'token',
  REMEMBERED_EMAIL: 'rememberedEmail',
} as const;
