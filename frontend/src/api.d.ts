import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { CacheService } from './services/cache';

declare module '@/api' {
  interface CachedResponse<T = any> {
    data: T;
    fromCache: boolean;
  }

  interface ApiInstance {
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    cachedGet<T = any>(
      url: string,
      strategyName: string,
      options?: AxiosRequestConfig & { force?: boolean }
    ): Promise<CachedResponse<T>>;
    invalidateCache(pattern: RegExp): void;
    clearCache(): void;
    interceptors: {
      request: any;
      response: any;
    };
  }

  export const api: ApiInstance;

  export const cacheService: CacheService;

  export const CACHE_KEYS: {
    readonly USER_DATA: 'USER_DATA';
    readonly TRANSACTIONS: 'TRANSACTIONS';
    readonly CARTEIRA: 'CARTEIRA';
    readonly ESTRATEGIAS: 'ESTRATEGIAS';
    readonly PORTFOLIO_DETAILS: 'PORTFOLIO_DETAILS';
  };

  export function getCacheTTL(strategyName: string): number;
}
