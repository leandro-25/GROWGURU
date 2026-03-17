import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api, CACHE_KEYS, cacheService } from '@/api';
import { toastController } from '@ionic/vue';
import type { User, UpdateProfilePayload } from '@/types';
import { logger } from '@/utils/logger';

// Types
export type { User, UpdateProfilePayload };

export interface ProfileState {
  loading: boolean;
  showNewPassword: boolean;
  showConfirmNewPassword: boolean;
}

export interface UserProfile {
  nome: string;
}

export function useProfile() {
  const router = useRouter();

  // State
  const loading = ref(false);
  const showNewPassword = ref(false);
  const showConfirmNewPassword = ref(false);

  const nome = ref('');
  const novaSenha = ref('');
  const confirmarNovaSenha = ref('');

  // Toast helper
  const showToast = async (
    message: string,
    color: 'primary' | 'success' | 'danger' | 'warning' = 'success'
  ) => {
    const toast = await toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top',
    });
    await toast.present();
  };

  // Actions
  const goBack = () => {
    router.push('/tabs/home');
  };

  const toggleNewPassword = () => {
    showNewPassword.value = !showNewPassword.value;
  };

  const toggleConfirmNewPassword = () => {
    showConfirmNewPassword.value = !showConfirmNewPassword.value;
  };

  // Validation functions
  const validateName = (): boolean => {
    if (!nome.value || nome.value.trim() === '') {
      showToast('Por favor, insira seu nome.', 'warning');
      return false;
    }
    return true;
  };

  const validatePassword = (): boolean => {
    if (novaSenha.value || confirmarNovaSenha.value) {
      if (!novaSenha.value) {
        showToast('Por favor, insira a nova senha.', 'warning');
        return false;
      }

      if (novaSenha.value !== confirmarNovaSenha.value) {
        showToast('As senhas não coincidem.', 'warning');
        return false;
      }

      if (novaSenha.value.length < 6) {
        showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
        return false;
      }
    }
    return true;
  };

  const validateForm = (): boolean => {
    const isNameValid = validateName();
    const isPasswordValid = validatePassword();

    return isNameValid && isPasswordValid;
  };

  // API functions
  const loadUserData = async () => {
    try {
      const { data } = await api.cachedGet('/usuarios', CACHE_KEYS.USER_DATA);
      nome.value = data.nome;
    } catch (error) {
      logger.error('Error loading user data:', error);
    }
  };

  const updateProfile = async () => {
    try {
      loading.value = true;

      if (!validateForm()) {
        return;
      }

      const payload: UpdateProfilePayload = {
        nome: nome.value.trim(),
      };

      if (novaSenha.value) {
        payload.novaSenha = novaSenha.value;
      }

      logger.debug('Sending request to update profile...');

      const response = await (api as any).put('/profile', payload);

      cacheService.invalidate(/usuarios/);

      if (response.data && response.data.success) {
        if (response.data.user) {
          nome.value = response.data.user.nome || nome.value;
        }

        await showToast(response.data.message || 'Perfil atualizado com sucesso!');

        setTimeout(() => {
          router.push('/tabs/home');
        }, 1000);
      } else {
        const errorMsg = response.data?.error || 'Erro ao atualizar perfil. Tente novamente.';
        await showToast(errorMsg, 'danger');
      }
    } catch (error: any) {
      logger.error('Error updating profile:', error);

      let errorMessage = 'Erro ao atualizar perfil. Tente novamente.';

      if (error.response) {
        const { data, status } = error.response;

        if (status === 401) {
          errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          setTimeout(() => {
            router.push('/login');
          }, 2000);
        } else if (status === 400) {
          errorMessage =
            data.error || 'Dados inválidos. Verifique as informações e tente novamente.';
        } else if (data && data.code === 'INVALID_PASSWORD') {
          errorMessage = 'A senha fornecida não atende aos requisitos mínimos.';
        } else if (data && data.code === 'DUPLICATE_USERNAME') {
          errorMessage = 'Este nome de usuário já está em uso. Escolha outro.';
        }
      } else if (error.request) {
        errorMessage =
          'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
      }

      await showToast(errorMessage, 'danger');
    } finally {
      loading.value = false;
    }
  };

  // Reset form
  const resetForm = () => {
    nome.value = '';
    novaSenha.value = '';
    confirmarNovaSenha.value = '';
    showNewPassword.value = false;
    showConfirmNewPassword.value = false;
  };

  // Initialize
  const initialize = () => {
    loadUserData();
  };

  return {
    // State
    loading,
    showNewPassword,
    showConfirmNewPassword,
    nome,
    novaSenha,
    confirmarNovaSenha,

    // Methods
    showToast,
    goBack,
    toggleNewPassword,
    toggleConfirmNewPassword,
    validateName,
    validatePassword,
    validateForm,
    loadUserData,
    updateProfile,
    resetForm,
    initialize,
  };
}
