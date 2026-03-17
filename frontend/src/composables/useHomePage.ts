import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { toastController } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { useAuthStore, useTransactionsStore } from '@/stores';
import { api, CACHE_KEYS, cacheService } from '@/api';
import type { Transaction, User } from '@/types';
import { logger } from '@/utils/logger';

// Types
export type { Transaction, User };

export interface UserData {
  nome: string;
  saldo: number;
  created_at: string;
}

export interface HomePageState {
  isLoading: boolean;
  lastUpdate: Date | null;
  isTransactionsModalOpen: boolean;
}

// Constants
const TRANSACTIONS_LIMIT = 4;
const SCROLL_THRESHOLD = 50;

/**
 * Composable for managing the HomePage data and interactions.
 * Provides state management for user data, transactions, and caching.
 *
 * @example
 * const {
 *   userName,
 *   saldo,
 *   visibleTransactions,
 *   loadAllData
 * } = useHomePage()
 */
export function useHomePage() {
  const router = useRouter();
  const route = useRoute();

  // Stores
  const authStore = useAuthStore();
  const transactionsStore = useTransactionsStore();

  const { user: storeUser } = storeToRefs(authStore);
  const {
    transactions: storeTransactions,
    isLoading: storeLoading,
    visibleTransactions: storeVisibleTransactions,
  } = storeToRefs(transactionsStore);

  // Local UI state
  const isLoading = computed(() => storeLoading.value);
  const lastUpdate = ref<Date | null>(null);
  const isTransactionsModalOpen = ref(false);
  const profileMenuOpen = ref(false);

  // User data from store
  const userName = ref(storeUser.value?.nome || 'Usuário');
  const saldo = ref(storeUser.value?.saldo || 0);
  const totalInvestido = ref(0);
  const userCreatedAt = ref(storeUser.value?.created_at || '');

  // Transactions from store
  const allTransactions = computed(() => storeTransactions.value);

  const currentPage = ref(1);
  const windowStart = ref(0);

  // Refs
  const content = ref(null);
  const visibleTransactions = computed(() => {
    // Use store's visibleTransactions if available
    return (
      storeVisibleTransactions.value ||
      allTransactions.value.slice(windowStart.value, windowStart.value + TRANSACTIONS_LIMIT)
    );
  });

  const rentabilidadePercentual = computed(() => {
    if (totalInvestido.value === 0 && saldo.value < 0) {
      return `-${Math.abs(saldo.value).toFixed(2)}`;
    }
    if (totalInvestido.value === 0) {
      return '0.00';
    }
    const percentual = ((saldo.value + totalInvestido.value) / totalInvestido.value) * 100;
    return `${percentual >= 0 ? '+' : ''}${percentual.toFixed(2)}`;
  });

  const rentabilidadeClasse = computed(() => {
    if (totalInvestido.value === 0 && saldo.value < 0) {
      return 'loss';
    }
    if (totalInvestido.value === 0) {
      return 'neutral';
    }
    const valor = saldo.value + totalInvestido.value;
    return valor >= 0 ? 'profit' : 'loss';
  });

  // Format functions
  const formatDate = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDateShort = (dataISO: string) => {
    return new Date(dataISO).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Load user data - uses store
  const loadUserData = async (force = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      // Use store to fetch user
      await authStore.fetchUser();

      // Update local refs
      userName.value = storeUser.value?.nome || 'Usuário';
      saldo.value = storeUser.value?.saldo || 0;
      userCreatedAt.value = storeUser.value?.created_at || '';

      return storeUser.value;
    } catch (error) {
      logger.error('Error loading user data:', error);
      throw error;
    }
  };

  // Load total invested
  const loadTotalInvested = async (force = false) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const { data: carteira } = await api.cachedGet('/carteira', CACHE_KEYS.CARTEIRA, {
        headers: { Authorization: `Bearer ${token}` },
        force,
      });

      const total = carteira.reduce((soma: number, estrategia: any) => {
        const investido = parseFloat(estrategia.total_investido) || 0;
        return soma + investido;
      }, 0);

      totalInvestido.value = total;

      await nextTick();
    } catch (error) {
      logger.error('Error loading total invested:', error);
      totalInvestido.value = 0;
    }
  };

  // Load transactions - uses store
  const loadTransactions = async (page: number, limit?: number) => {
    try {
      // Use store to fetch transactions
      await transactionsStore.fetchTransactions(page);

      return storeTransactions.value;
    } catch (error) {
      logger.error('Error loading transactions:', error);
    }
  };

  // Load initial data
  const loadInitialData = async () => {
    try {
      if (isLoading.value) return;

      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      // Fetch user and transactions in parallel
      await Promise.all([authStore.fetchUser(), transactionsStore.fetchTransactions(1)]);

      // Load total invested
      await loadTotalInvested();

      userName.value = storeUser.value?.nome || 'Usuário';
      saldo.value = parseFloat(String(storeUser.value?.saldo || 0)) || 0;
      userCreatedAt.value = storeUser.value?.created_at || '';

      lastUpdate.value = new Date();
    } catch (error: any) {
      logger.error('Error loading data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        router.push('/login');
      }
    }
  };

  // Load all data
  const loadAllData = async () => {
    try {
      await Promise.all([loadUserData(true), loadTransactions(0), loadTotalInvested()]);
    } catch (error) {
      logger.error('Error loading data:', error);
    }
  };

  const refreshData = async (event: any = null) => {
    try {
      cacheService.clear();
      await loadAllData();
    } finally {
      if (event?.target) {
        event.target.complete();
      }
    }
  };

  // Handle scroll
  const handleScroll = async (event: any) => {
    const scrollElement = event.target;
    const scrollTop = scrollElement.scrollTop;
    const scrollHeight = scrollElement.scrollHeight;
    const height = scrollElement.clientHeight;

    if (scrollHeight - (scrollTop + height) < SCROLL_THRESHOLD) {
      const nextPage = currentPage.value + 1;
      await loadTransactions(nextPage);
      currentPage.value = nextPage;
    }

    if (scrollTop <= 100 && windowStart.value > 0) {
      windowStart.value -= 1;
    }
  };

  // Handle refresh - invalidate cache and reload
  const handleRefresh = async (event: any) => {
    cacheService.clear();
    windowStart.value = 0;
    currentPage.value = 0;

    await refreshData(event);
  };

  // Profile menu functions
  const openProfileMenu = (event: any) => {
    profileMenuOpen.value = true;
  };

  const goToProfile = () => {
    profileMenuOpen.value = false;
    router.push('/profile');
  };

  const logout = async () => {
    try {
      profileMenuOpen.value = false;

      // Use store for logout
      authStore.logout();

      const toast = await toastController.create({
        message: 'Desconectado com sucesso!',
        duration: 2000,
        color: 'success',
        position: 'top',
      });
      await toast.present();

      setTimeout(() => {
        router.push('/login');
      }, 500);
    } catch (error) {
      logger.error('Error during logout:', error);
    }
  };

  // Transaction modal
  const openTransactionsModal = async () => {
    try {
      // Load all transactions for modal if needed
      if (storeTransactions.value.length < 100) {
        await transactionsStore.fetchTransactions(1);
      }
      isTransactionsModalOpen.value = true;
    } catch (error) {
      logger.error('Error opening transactions modal:', error);
    }
  };

  // Event handlers
  const handleSaldoAtualizado = (event: any) => {
    saldo.value = event.detail.novo_saldo;
    cacheService.invalidate(/usuarios/);
    cacheService.invalidate(/carteira/);
    cacheService.invalidate(/transacoes/);
    loadTransactions(1);
    loadTotalInvested(true);
  };

  const handleTransacaoAtualizada = () => {
    cacheService.invalidate(/transacoes/);
    cacheService.invalidate(/carteira/);
    cacheService.invalidate(/usuarios/);
    loadTransactions(1);
    loadTotalInvested(true);
  };

  // Initialize
  const initialize = async () => {
    await loadAllData();

    window.addEventListener('saldo-atualizado', handleSaldoAtualizado);
    window.addEventListener('transacao-atualizada', handleTransacaoAtualizada);
  };

  // Cleanup
  const cleanup = () => {
    window.removeEventListener('saldo-atualizado', handleSaldoAtualizado);
    window.removeEventListener('transacao-atualizada', handleTransacaoAtualizada);
  };

  return {
    // State
    isLoading,
    lastUpdate,
    isTransactionsModalOpen,
    profileMenuOpen,
    userName,
    saldo,
    totalInvestido,
    userCreatedAt,
    allTransactions,
    currentPage,
    windowStart,
    content,

    // Computed
    visibleTransactions,
    rentabilidadePercentual,
    rentabilidadeClasse,

    // Methods
    loadUserData,
    loadTransactions,
    loadInitialData,
    loadAllData,
    loadTotalInvested,
    refreshData,
    handleScroll,
    handleRefresh,
    openProfileMenu,
    goToProfile,
    logout,
    openTransactionsModal,
    formatDate,
    formatDateShort,
    initialize,
    cleanup,
  };
}
