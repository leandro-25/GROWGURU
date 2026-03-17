type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = import.meta.env.DEV;

function shouldLog(level: LogLevel): boolean {
  if (isDevelopment) return true;
  return level !== 'debug';
}

export const logger = {
  debug: (message: string, data?: unknown) => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, data ?? '');
    }
  },

  info: (message: string, data?: unknown) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, data ?? '');
    }
  },

  warn: (message: string, data?: unknown) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, data ?? '');
    }
  },

  error: (message: string, error?: unknown) => {
    console.error(`[ERROR] ${message}`, error ?? '');
  },

  metric: (name: string, value: number, tags?: Record<string, string>) => {
    if (isDevelopment) {
      console.log(`[METRIC] ${name}: ${value}`, tags ?? '');
    }
  },
};
