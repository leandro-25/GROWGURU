<template>
  <ion-page class="reset-password-page">
    <ion-content class="h-screen overflow-hidden" :scroll-y="false">
      <div class="reset-password-container">
        <div class="reset-password-box">
          <div class="logo-wrapper">
            <img src="@/assets/imagem/logo.png" alt="GrowGuru" />
          </div>
          <h1 class="title">Redefinir Senha</h1>

          <div class="reset-password-form">
            <div class="form-group">
              <label>Nova Senha</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Digite sua nova senha"
                  required
                >
                </ion-input>
                <IonIcon
                  :icon="showPassword ? eyeOff : eye"
                  class="password-toggle"
                  @click="showPassword = !showPassword"
                  :aria-label="showPassword ? 'Ocultar senha' : 'Mostrar senha'"
                >
                </IonIcon>
              </div>
            </div>

            <div class="form-group">
              <label>Confirme a Nova Senha</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="confirmPassword"
                  :type="showConfirmPassword ? 'text' : 'password'"
                  placeholder="Confirme sua nova senha"
                  required
                >
                </ion-input>
                <IonIcon
                  :icon="showConfirmPassword ? eyeOff : eye"
                  class="password-toggle"
                  @click="showConfirmPassword = !showConfirmPassword"
                  :aria-label="
                    showConfirmPassword
                      ? 'Ocultar confirmação de senha'
                      : 'Mostrar confirmação de senha'
                  "
                >
                </IonIcon>
              </div>
            </div>

            <div class="form-group">
              <div class="password-requirements">
                A senha deve conter pelo menos 8 caracteres, incluindo letras maiúsculas,
                minúsculas, números e caracteres especiais.
              </div>
            </div>

            <ion-button
              type="submit"
              expand="block"
              class="submit-button"
              :disabled="!isFormValid || isLoading"
              @click="handleSubmit"
            >
              <ion-spinner v-if="isLoading" name="crescent" class="w-5 h-5"></ion-spinner>
              <span v-else>Redefinir Senha</span>
            </ion-button>
            <div class="login-container">
              <p>
                Lembrou sua senha?
                <router-link to="/login" class="login-link">Faça login</router-link>
              </p>
            </div>
            <div v-if="errorMessage" class="rp-message rp-message--error">{{ errorMessage }}</div>
            <div v-if="successMessage" class="rp-message rp-message--success">
              {{ successMessage }}
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { warning, checkmarkCircle, eye, eyeOff } from 'ionicons/icons';
import { useRoute, useRouter } from 'vue-router';
import {
  IonPage,
  IonContent,
  IonInput,
  IonSpinner,
  IonButton,
  IonIcon,
  toastController,
  loadingController,
} from '@ionic/vue';
import { supabase } from '@/lib/supabase';
import { logger } from '@/utils/logger';

const route = useRoute();
const router = useRouter();
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const isLoading = ref(false);
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const token = ref('');
const refreshToken = ref('');

// Verifica o token de recuperação na URL
onMounted(async () => {
  // Extrai o token da URL
  const hash = window.location.hash.substring(1);
  const params = new URLSearchParams(hash);
  const accessToken = params.get('access_token');
  const rToken = params.get('refresh_token');
  const type = params.get('type');

  if (accessToken && type === 'recovery') {
    token.value = accessToken;
    refreshToken.value = rToken || '';
    logger.debug('Token extracted from URL:', token.value);

    try {
      // Verifica se o token é válido
      const { data: userData, error: userError } = await supabase.auth.getUser(accessToken);

      if (userError) {
        logger.error('Error verifying token:', userError);
        errorMessage.value =
          'Link de redefinição expirado ou inválido. Por favor, solicite um novo link.';

        // Mostra um toast com a mensagem de erro
        const toast = await toastController.create({
          message: 'Link de redefinição expirado ou inválido. Por favor, solicite um novo link.',
          duration: 5000,
          color: 'danger',
          position: 'bottom',
        });
        await toast.present();

        // Redireciona para a tela de esqueci a senha após 3 segundos
        setTimeout(() => {
          router.push('/forgot-password');
        }, 3000);

        return;
      }

      logger.debug('Token verified successfully for user:', userData.user?.email);
    } catch (error) {
      logger.error('Error verifying token:', error);
      errorMessage.value = 'Erro ao verificar o link de redefinição. Tente novamente.';

      const toast = await toastController.create({
        message: 'Erro ao verificar o link de redefinição. Tente novamente.',
        duration: 5000,
        color: 'danger',
        position: 'bottom',
      });
      await toast.present();
    }
  } else {
    errorMessage.value = 'Link de redefinição inválido.';

    const toast = await toastController.create({
      message: 'Link de redefinição inválido.',
      duration: 5000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();

    // Redireciona para a tela de login após 3 segundos
    setTimeout(() => {
      router.push('/login');
    }, 3000);
  }
});

// Verifica se o formulário é válido
const isFormValid = computed(() => {
  return password.value.length >= 6 && password.value === confirmPassword.value && token.value;
});

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'As senhas não coincidem.';
    return;
  }

  if (password.value.length < 6) {
    errorMessage.value = 'A senha deve ter pelo menos 6 caracteres.';
    return;
  }

  if (!token.value) {
    errorMessage.value = 'Token de redefinição não encontrado.';
    return;
  }

  isLoading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  const loading = await loadingController.create({
    message: 'Redefinindo senha...',
    duration: 0,
  });
  await loading.present();

  try {
    logger.debug('Starting password reset process...');
    logger.debug('Token being used:', token.value);

    // 1. Primeiro, estabelecemos a sessão com o token
    logger.debug('Establishing session...');
    logger.debug('Access Token length:', token.value?.length);
    logger.debug('Refresh Token:', refreshToken.value ? 'Present' : 'Absent');
    logger.debug('Refresh Token length:', refreshToken.value?.length);

    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: token.value,
      refresh_token: refreshToken.value,
    });

    if (sessionError) {
      logger.error('Error establishing session:', sessionError);
      logger.error('Error details:', JSON.stringify(sessionError));

      // Tentativa de fallback: se setSession falhar, tentar apenas com access_token
      // verificando se o usuário é válido e usando fetch direto
      const { data: userCheck, error: userCheckError } = await supabase.auth.getUser(token.value);

      if (userCheckError) {
        throw new Error(
          'Não foi possível validar a sessão. O link pode ter expirado. Por favor, solicite um novo link.'
        );
      }

      logger.debug('User validated via getUser. Trying update via direct API...');

      // Fallback: Atualização direta via REST API
      // Isso contorna a verificação de sessão do cliente JS
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      const updateUrl = `${supabaseUrl}/auth/v1/user`;

      const response = await fetch(updateUrl, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token.value}`,
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
        body: JSON.stringify({
          password: password.value,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        logger.error('Error in direct update:', errorData);
        throw new Error(
          errorData.msg || errorData.message || 'Erro ao atualizar senha via fallback.'
        );
      }

      logger.debug('Password updated successfully via direct API!');

      // Pula a chamada padrão do supabase.auth.updateUser
      // e vai direto para o sucesso
    } else {
      logger.debug('Session established successfully:', sessionData);

      // 2. Agora que temos uma sessão, atualizamos a senha da maneira padrão
      const { error: updateError } = await supabase.auth.updateUser({
        password: password.value,
      });

      if (updateError) {
        logger.error('Error updating password:', updateError);
        throw updateError;
      }
    }

    logger.debug('Password updated successfully!');

    // Mostra mensagem de sucesso
    const toast = await toastController.create({
      message: 'Senha redefinida com sucesso!',
      duration: 3000,
      position: 'bottom',
      color: 'success',
    });
    await toast.present();

    // Redireciona para o login após 2 segundos
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    logger.error('Error resetting password:', error);

    let errorMessageText = 'Não foi possível redefinir a senha. ';

    if (error.message) {
      if (
        error.message.includes('expirado') ||
        error.message.includes('expirou') ||
        error.message.includes('inválido') ||
        error.message.includes('expired') ||
        error.message.includes('invalid') ||
        error.message.includes('AuthSessionMissing')
      ) {
        errorMessageText =
          'O link de redefinição expirou ou é inválido. Por favor, solicite um novo link.';
      } else if (error.message.includes('fraca') || error.message.includes('weak')) {
        errorMessageText = 'A senha é muito fraca. Use pelo menos 6 caracteres.';
      } else {
        errorMessageText += 'Tente novamente ou solicite um novo link de redefinição.';
      }
    }

    errorMessage.value = errorMessageText;

    const toast = await toastController.create({
      message: errorMessageText,
      duration: 5000,
      color: 'danger',
      position: 'bottom',
    });
    await toast.present();
  } finally {
    loading.dismiss();
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
@import '@/theme/reset-password.scss';

.rp-message {
  width: 100% !important;
  margin: 0.75rem 0 !important;
  padding: 0.75rem 1rem !important;
  border-radius: 0.5rem !important;
  font-size: 0.875rem !important;
  line-height: 1.5 !important;
  text-align: center !important;
  display: block !important;
  box-sizing: border-box !important;

  &--error {
    background-color: rgba(239, 68, 68, 0.1) !important;
    color: #ff0000 !important;
    font-weight: 500 !important;
    border: 1px solid rgba(239, 68, 68, 0.3) !important;
  }

  &--success {
    background-color: rgba(16, 185, 129, 0.1) !important;
    color: #008000 !important;
    font-weight: 500 !important;
    border: 1px solid rgba(16, 185, 129, 0.3) !important;
  }
}
</style>
