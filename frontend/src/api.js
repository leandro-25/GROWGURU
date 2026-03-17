import axios from 'axios';
import { cacheService, getCacheTTL, CACHE_KEYS } from './services/cache';

// Configuração da URL base da API
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

console.log('API Base URL:', baseURL);

const api = axios.create({
  baseURL: baseURL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Cache helper functions
const getCacheKey = (url, params = {}) => {
  return `${url}?${JSON.stringify(params)}`;
};

const getStrategyForEndpoint = url => {
  if (url.includes('/usuarios')) return CACHE_KEYS.USER_DATA;
  if (url.includes('/transacoes')) return CACHE_KEYS.TRANSACTIONS;
  if (url.includes('/carteira')) return CACHE_KEYS.CARTEIRA;
  if (url.includes('/estrategias')) return CACHE_KEYS.ESTRATEGIAS;
  return null;
};

// Custom axios method with caching
api.cachedGet = async (url, strategyName, options = {}) => {
  const cacheKey = getCacheKey(url, options.params || {});

  // Try to get from cache first
  if (!options.force) {
    const cachedData = cacheService.get(cacheKey);
    if (cachedData) {
      if (import.meta.env.DEV) {
        console.log(`[CACHE] HIT: ${url}`);
      }
      return { data: cachedData, fromCache: true };
    }
  }

  // Make the request
  const ttl = getCacheTTL(strategyName);
  const response = await api.get(url, options);

  // Store in cache
  cacheService.set(cacheKey, response.data, ttl);

  if (import.meta.env.DEV) {
    console.log(`[CACHE] MISS: ${url} (TTL: ${ttl}ms)`);
  }

  return { data: response.data, fromCache: false };
};

// Invalidate cache for specific endpoints
api.invalidateCache = pattern => {
  cacheService.invalidate(pattern);
};

// Clear all cache
api.clearCache = () => {
  cacheService.clear();
};

// Interceptor de requisição
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log da requisição (apenas em desenvolvimento)
    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        params: config.params,
        headers: config.headers,
      });
    }

    return config;
  },
  error => {
    console.error('[API] Erro na requisição:', error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  response => {
    // Log da resposta (apenas em desenvolvimento)
    if (import.meta.env.NODE_ENV === 'development') {
      console.log(`[API] Resposta ${response.status} de ${response.config.url}`, response.data);
    }
    return response;
  },
  error => {
    // Tratamento de erros
    if (error.response) {
      // A requisição foi feita e o servidor respondeu com um status fora do intervalo 2xx
      console.error('[API] Erro na resposta:', {
        status: error.response.status,
        statusText: error.response.statusText,
        url: error.config?.url,
        data: error.response.data,
      });

      // Tratamento específico para erros de autenticação
      if (error.response.status === 401) {
        // Redirecionar para login ou renovar token
        console.warn('[API] Não autorizado - redirecionando para login');
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
    } else if (error.request) {
      // A requisição foi feita mas não houve resposta
      console.error('[API] Sem resposta do servidor:', error.request);
    } else {
      // Algo aconteceu na configuração da requisição
      console.error('[API] Erro ao configurar a requisição:', error.message);
    }

    return Promise.reject(error);
  }
);

export { api, cacheService, CACHE_KEYS, getCacheTTL };
