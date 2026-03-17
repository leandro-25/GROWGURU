import { ref, computed, onMounted, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { api, CACHE_KEYS, cacheService } from '@/api';
import type { Strategy } from '@/types';
import { logger } from '@/utils/logger';

// Types
export type { Strategy };

export interface EstrategiasState {
  loading: boolean;
  typeFilter: string;
  strategyTypes: string[];
}

/**
 * Composable for managing investment strategies data.
 * Provides state management for strategies list, filtering, and navigation.
 *
 * @example
 * const {
 *   strategies,
 *   filteredStrategies,
 *   loading,
 *   loadStrategies
 * } = useEstrategias()
 */
export function useEstrategias() {
  const router = useRouter();

  // State
  const loading = ref(true);
  const typeFilter = ref('');
  const strategyTypes = ref<string[]>([]);
  const strategies = ref<Strategy[]>([]);

  // Computed properties
  const filteredStrategies = computed(() => {
    if (!typeFilter.value) {
      return [...strategies.value];
    }
    return strategies.value.filter(estrategia => estrategia.tipo_estrategia === typeFilter.value);
  });

  // Format functions
  /**
   * Formats an ISO date string to Brazilian date format.
   * @param dataISO - ISO date string (e.g., "2024-01-15T10:30:00Z")
   * @returns Formatted date (e.g., "15 de janeiro de 2024")
   */
  const formatDate = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatRentabilidade = (valor: number | null) => {
    if (!valor) return 'N/A';
    return `${valor.toFixed(2)}%`;
  };

  const getRentabilidadeColor = (valor: number | null) => {
    if (!valor) return 'medium';
    return valor >= 0 ? 'success' : 'danger';
  };

  const getRentabilidadeClass = (valor: number | null, isValue = false) => {
    if (!valor) return 'neutral';
    return valor >= 0 ? 'positive-value' : 'negative-value';
  };

  // Actions
  const viewDetails = (id: string) => {
    router.push({
      name: 'AtivosEstrategia',
      params: { id },
    });
  };

  const handleRefresh = async (event: any) => {
    cacheService.invalidate(/estrategias/);
    await loadStrategies();
    event.target.complete();
  };

  const refreshStrategies = () => {
    loading.value = true;
    cacheService.invalidate(/estrategias/);
    loadStrategies();
  };

  const applyFilter = () => {
    // The computed property handles filtering automatically
  };

  const loadStrategies = async () => {
    try {
      const { data } = await api.cachedGet('/estrategias', CACHE_KEYS.ESTRATEGIAS);
      strategies.value = data;

      // Extract unique strategy types
      const uniqueTypes = [
        ...new Set(data.map((e: Strategy) => e.tipo_estrategia).filter(Boolean)),
      ];
      strategyTypes.value = uniqueTypes.sort() as string[];
    } catch (error) {
      logger.error('Error loading strategies:', error);
    } finally {
      loading.value = false;
    }
  };

  // Initialize
  const initialize = () => {
    loadStrategies();
  };

  return {
    // State
    loading,
    typeFilter,
    strategyTypes,
    strategies,

    // Computed
    filteredStrategies,

    // Methods
    formatDate,
    formatRentabilidade,
    getRentabilidadeColor,
    getRentabilidadeClass,
    viewDetails,
    handleRefresh,
    refreshStrategies,
    applyFilter,
    loadStrategies,
    initialize,
  };
}
