import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import { toastController } from '@ionic/vue';
import { logger } from '@/utils/logger';

// Types
export interface ForgotPasswordState {
  isLoading: boolean;
  errorMessage: string;
}

export function useForgotPassword() {
  const router = useRouter();

  // State
  const isLoading = ref(false);
  const errorMessage = ref('');
  const email = ref('');

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

  // Validation
  const validateEmail = (): boolean => {
    if (!email.value || email.value.trim() === '') {
      errorMessage.value = 'Por favor, insira seu email.';
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      errorMessage.value = 'Por favor, insira um email válido.';
      return false;
    }

    errorMessage.value = '';
    return true;
  };

  // API functions
  const sendRecoveryLink = async () => {
    try {
      isLoading.value = true;
      errorMessage.value = '';

      if (!validateEmail()) {
        return;
      }

      const response = await (api as any).post('/forgot-password', {
        email: email.value.trim().toLowerCase(),
      });

      await showToast(response.data.message || 'Link de recuperação enviado com sucesso!');

      // Redirect to login after success
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    } catch (error: any) {
      logger.error('Error sending recovery link:', error);

      let errorMessageText = 'Erro ao enviar o link. Tente novamente.';

      if (error.response) {
        const { data, status } = error.response;

        if (status === 404) {
          errorMessageText = 'Email não encontrado em nossa base de dados.';
        } else if (status === 429) {
          errorMessageText = 'Muitas tentativas. Tente novamente em alguns minutos.';
        } else if (data?.error) {
          errorMessageText = data.error;
        }
      } else if (error.request) {
        errorMessageText = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }

      errorMessage.value = errorMessageText;
      await showToast(errorMessageText, 'danger');
    } finally {
      isLoading.value = false;
    }
  };

  // Navigation
  const goToLogin = () => {
    router.push('/login');
  };

  // Reset form
  const resetForm = () => {
    email.value = '';
    errorMessage.value = '';
    isLoading.value = false;
  };

  return {
    // State
    isLoading,
    errorMessage,
    email,

    // Methods
    showToast,
    validateEmail,
    sendRecoveryLink,
    goToLogin,
    resetForm,
  };
}
