import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { api } from '@/api';
import { toastController } from '@ionic/vue';
import { logger } from '@/utils/logger';

// Types
export interface SignUpState {
  loading: boolean;
  showPassword: boolean;
  showConfirmPassword: boolean;
}

export interface SignUpPayload {
  nome: string;
  email: string;
  password: string;
}

export function useSignUp() {
  const router = useRouter();

  // State
  const loading = ref(false);
  const showPassword = ref(false);
  const showConfirmPassword = ref(false);

  const nome = ref('');
  const email = ref('');
  const senha = ref('');
  const confirmarSenha = ref('');

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
  const togglePassword = () => {
    showPassword.value = !showPassword.value;
  };

  const toggleConfirmPassword = () => {
    showConfirmPassword.value = !showConfirmPassword.value;
  };

  // Validation functions
  const validateName = (): boolean => {
    if (!nome.value || nome.value.trim() === '') {
      showToast('Por favor, insira seu nome completo.', 'warning');
      return false;
    }

    if (nome.value.trim().length < 3) {
      showToast('O nome deve ter pelo menos 3 caracteres.', 'warning');
      return false;
    }

    return true;
  };

  const validateEmail = (): boolean => {
    if (!email.value || email.value.trim() === '') {
      showToast('Por favor, insira seu email.', 'warning');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.value)) {
      showToast('Por favor, insira um email válido.', 'warning');
      return false;
    }

    return true;
  };

  const validatePassword = (): boolean => {
    if (!senha.value) {
      showToast('Por favor, insira uma senha.', 'warning');
      return false;
    }

    if (senha.value.length < 6) {
      showToast('A senha deve ter pelo menos 6 caracteres.', 'warning');
      return false;
    }

    if (!confirmarSenha.value) {
      showToast('Por favor, confirme sua senha.', 'warning');
      return false;
    }

    if (senha.value !== confirmarSenha.value) {
      showToast('As senhas não coincidem.', 'warning');
      return false;
    }

    return true;
  };

  const validateForm = (): boolean => {
    const isNameValid = validateName();
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    return isNameValid && isEmailValid && isPasswordValid;
  };

  // API functions
  const signUp = async () => {
    try {
      loading.value = true;

      if (!validateForm()) {
        return;
      }

      const payload: SignUpPayload = {
        nome: nome.value.trim(),
        email: email.value.trim().toLowerCase(),
        password: senha.value,
      };

      const { data } = await (api as any).post('/signup', payload);

      if (data.user) {
        await showToast('Cadastro realizado com sucesso!');

        // Redirect to login after success
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (error: any) {
      logger.error('Signup error:', error);

      let errorMessage = 'Erro ao cadastrar. Tente novamente.';

      if (error.response) {
        const { data, status } = error.response;

        if (status === 409) {
          errorMessage = 'Este email já está em uso. Tente outro.';
        } else if (status === 400) {
          errorMessage = data.error || 'Dados inválidos. Verifique as informações.';
        } else if (data?.error) {
          errorMessage = data.error;
        }
      } else if (error.request) {
        errorMessage = 'Não foi possível conectar ao servidor. Verifique sua conexão.';
      }

      await showToast(errorMessage, 'danger');
    } finally {
      loading.value = false;
    }
  };

  // Navigation
  const goToLogin = () => {
    router.push('/login');
  };

  // Reset form
  const resetForm = () => {
    nome.value = '';
    email.value = '';
    senha.value = '';
    confirmarSenha.value = '';
    showPassword.value = false;
    showConfirmPassword.value = false;
    loading.value = false;
  };

  return {
    // State
    loading,
    showPassword,
    showConfirmPassword,
    nome,
    email,
    senha,
    confirmarSenha,

    // Methods
    showToast,
    togglePassword,
    toggleConfirmPassword,
    validateName,
    validateEmail,
    validatePassword,
    validateForm,
    signUp,
    goToLogin,
    resetForm,
  };
}
