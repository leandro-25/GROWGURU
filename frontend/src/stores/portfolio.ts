import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Strategy } from '@/types';
import { api, CACHE_KEYS } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { logger } from '@/utils/logger';

export const usePortfolioStore = defineStore('portfolio', () => {
  const estrategias = ref<Strategy[]>([]);
  const isLoading = ref(false);
  const lastUpdate = ref<Date | null>(null);

  const totalValue = computed(() => {
    return estrategias.value.reduce((total, estrategia) => {
      return total + (estrategia.total_investido || 0);
    }, 0);
  });

  const estrategiasAbertas = computed(() => {
    return estrategias.value.filter(e => e.aberto);
  });

  async function fetchPortfolio(): Promise<void> {
    try {
      isLoading.value = true;
      const { data } = await api.cachedGet(API_ENDPOINTS.CARTEIRA, CACHE_KEYS.CARTEIRA);

      estrategias.value = data.map((estrategia: any) => ({
        ...estrategia,
        aberto: false,
        ativos:
          estrategia.ativos?.map((ativo: any) => ({
            ...ativo,
            quantidadeVenda: 0,
            precoVenda: ativo.valor_medio || ativo.preco_atual || 0,
            codigo: ativo.codigo || ativo.codigo_ativo,
          })) || [],
      }));

      lastUpdate.value = new Date();
      logger.debug('Portfolio carregado', { count: estrategias.value.length });
    } catch (error) {
      logger.error('Erro ao carregar portfolio', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function toggleEstrategia(id: string): void {
    estrategias.value = estrategias.value.map(e => ({
      ...e,
      aberto: e.id === id ? !e.aberto : e.aberto,
    }));
  }

  return {
    estrategias,
    isLoading,
    lastUpdate,
    totalValue,
    estrategiasAbertas,
    fetchPortfolio,
    toggleEstrategia,
  };
});
