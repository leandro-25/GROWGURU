import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/types';
import { api, CACHE_KEYS } from '@/api';
import { API_ENDPOINTS } from '@/constants';
import { logger } from '@/utils/logger';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const token = ref<string | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!token.value);
  const userName = computed(() => user.value?.nome || 'Usuário');
  const userEmail = computed(() => user.value?.email || '');
  const userBalance = computed(() => user.value?.saldo || 0);

  function setToken(newToken: string): void {
    token.value = newToken;
    localStorage.setItem('token', newToken);
  }

  function clearAuth(): void {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('rememberedEmail');
  }

  async function fetchUser(): Promise<void> {
    try {
      const response = await api.cachedGet(API_ENDPOINTS.USUARIOS_ME, CACHE_KEYS.USER_DATA);
      user.value = response.data.data || response.data;
    } catch (error) {
      logger.error('Erro ao buscar dados do usuário', error);
      throw error;
    }
  }

  async function login(email: string, password: string): Promise<boolean> {
    try {
      isLoading.value = true;
      const response = await api.post(API_ENDPOINTS.LOGIN, {
        email: email.trim().toLowerCase(),
        password,
      });

      const loginData = response.data;
      setToken(loginData.session.access_token);
      await fetchUser();

      logger.info('Login realizado com sucesso');
      return true;
    } catch (error) {
      logger.error('Erro no login', error);
      throw error;
    } finally {
      isLoading.value = false;
    }
  }

  async function logout(): Promise<void> {
    clearAuth();
    logger.info('Logout realizado');
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    userName,
    userEmail,
    userBalance,
    setToken,
    clearAuth,
    fetchUser,
    login,
    logout,
  };
});
