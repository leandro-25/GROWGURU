import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { Transaction } from '@/types';
import { api, CACHE_KEYS } from '@/api';
import { API_ENDPOINTS, UI_CONSTANTS } from '@/constants';
import { logger } from '@/utils/logger';

export const useTransactionsStore = defineStore('transactions', () => {
  const transactions = ref<Transaction[]>([]);
  const isLoading = ref(false);
  const currentPage = ref(1);

  const sortedTransactions = computed(() => {
    return [...transactions.value].sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  });

  const visibleTransactions = computed(() => {
    return sortedTransactions.value.slice(0, UI_CONSTANTS.MAX_VISIBLE_TRANSACTIONS);
  });

  const recentTransactions = computed(() => {
    return sortedTransactions.value.slice(0, UI_CONSTANTS.TRANSACTIONS_PER_PAGE);
  });

  async function fetchTransactions(page = 1): Promise<void> {
    try {
      isLoading.value = true;
      const { data } = await api.cachedGet(API_ENDPOINTS.TRANSACOES, CACHE_KEYS.TRANSACTIONS, {
        params: { page, limit: UI_CONSTANTS.TRANSACTIONS_PER_PAGE },
      });

      if (page === 1) {
        transactions.value = data;
      } else {
        const existingIds = new Set(transactions.value.map(t => t.id));
        const newTransactions = data.filter((t: Transaction) => !existingIds.has(t.id));
        transactions.value = [...transactions.value, ...newTransactions];
      }

      currentPage.value = page;
      logger.debug('Transações carregadas', { page, count: data.length });
    } catch (error) {
      logger.error('Erro ao carregar transações', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  function addTransaction(transaction: Transaction): void {
    transactions.value.unshift(transaction);
  }

  return {
    transactions,
    isLoading,
    currentPage,
    sortedTransactions,
    visibleTransactions,
    recentTransactions,
    fetchTransactions,
    addTransaction,
  };
});
