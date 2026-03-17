import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/stores';
import type { User, LoginCredentials } from '@/types';

// Types
export type { User, LoginCredentials };

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ToastState {
  show: boolean;
  message: string;
  color: 'primary' | 'success' | 'danger' | 'warning';
}

// Validation rules
export const VALIDATION_RULES = {
  email: {
    required: 'Email é obrigatório',
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    invalid: 'Email inválido',
  },
  password: {
    required: 'Senha é obrigatória',
    minLength: 6,
    invalid: 'Senha deve ter pelo menos 6 caracteres',
  },
} as const;

export function useAuth() {
  const router = useRouter();
  const authStore = useAuthStore();

  const { user: storeUser, isLoading: storeLoading, token } = storeToRefs(authStore);

  // Local UI state (not in store)
  const email = ref('');
  const password = ref('');
  const emailError = ref('');
  const passwordError = ref('');
  const showPassword = ref(false);
  const rememberMe = ref(false);
  const error = ref<string | null>(null);

  // Toast state
  const toast = ref<ToastState>({
    show: false,
    message: '',
    color: 'primary',
  });

  // Computed - combine store state with local state
  const user = computed(() => storeUser.value);
  const isLoading = computed(() => storeLoading.value);
  const isValidForm = computed(() => {
    return email.value && password.value && !emailError.value && !passwordError.value;
  });

  const isAuthenticated = computed(() => !!token.value || !!user.value);

  // Validation functions
  const validateEmail = (): boolean => {
    if (!email.value) {
      emailError.value = VALIDATION_RULES.email.required;
      return false;
    }

    if (!VALIDATION_RULES.email.pattern.test(email.value)) {
      emailError.value = VALIDATION_RULES.email.invalid;
      return false;
    }

    emailError.value = '';
    return true;
  };

  const validatePassword = (): boolean => {
    if (!password.value) {
      passwordError.value = VALIDATION_RULES.password.required;
      return false;
    }

    if (password.value.length < VALIDATION_RULES.password.minLength) {
      passwordError.value = VALIDATION_RULES.password.invalid;
      return false;
    }

    passwordError.value = '';
    return true;
  };

  const validateForm = (): boolean => {
    const isEmailValid = validateEmail();
    const isPasswordValid = validatePassword();

    if (!isEmailValid || !isPasswordValid) {
      showToast('Por favor, corrija os erros no formulário', 'danger');
      return false;
    }

    return true;
  };

  // Toast helper
  const showToast = (message: string, color: ToastState['color'] = 'primary') => {
    toast.value = {
      show: true,
      message,
      color,
    };
  };

  // Storage helpers
  const saveRememberedEmail = () => {
    if (rememberMe.value) {
      localStorage.setItem('rememberedEmail', email.value);
    } else {
      localStorage.removeItem('rememberedEmail');
    }
  };

  const loadRememberedEmail = () => {
    const savedEmail = localStorage.getItem('rememberedEmail');
    if (savedEmail) {
      email.value = savedEmail;
      rememberMe.value = true;
    }
  };

  // Login function - uses store
  const login = async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    error.value = null;
    toast.value.show = false;

    try {
      // Use store for authentication
      await authStore.login(email.value.trim().toLowerCase(), password.value);

      // Save remembered email
      saveRememberedEmail();

      // Show success message
      showToast('Login realizado com sucesso!', 'success');

      // Handle redirect
      await handleRedirect();

      return true;
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'E-mail ou senha incorretos';
      error.value = errorMessage;
      showToast(errorMessage, 'danger');
      return false;
    }
  };

  // Logout function - uses store
  const logout = () => {
    authStore.logout();
    router.push('/login');
  };

  // Redirect handler
  const handleRedirect = async () => {
    await new Promise(resolve => setTimeout(resolve, 300));

    const isCapacitor = (window as any).Capacitor?.isNativePlatform;

    if (isCapacitor) {
      window.location.href = '/tabs/home';
    } else {
      try {
        await router.push('/tabs/home');
      } catch {
        window.location.href = '/tabs/home';
      }
    }
  };

  // Reset form
  const resetForm = () => {
    email.value = '';
    password.value = '';
    emailError.value = '';
    passwordError.value = '';
    showPassword.value = false;
    error.value = null;
  };

  // Initialize
  const initialize = () => {
    loadRememberedEmail();
  };

  return {
    // State (from store + local)
    user,
    isLoading,
    error,
    email,
    password,
    emailError,
    passwordError,
    showPassword,
    rememberMe,
    toast,

    // Computed
    isValidForm,
    isAuthenticated,

    // Methods
    login,
    logout,
    validateEmail,
    validatePassword,
    validateForm,
    resetForm,
    initialize,
    showToast,
  };
}
