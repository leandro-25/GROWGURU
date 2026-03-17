<template>
  <ion-page class="login-page">
    <ion-content>
      <div class="login-container">
        <div class="login-box">
          <div class="logo-wrapper">
            <img src="@/assets/imagem/logo.png" alt="GrowGuru" />
          </div>
          <h2 class="title">Entre na sua conta</h2>

          <form @submit.prevent="handleLogin" @keyup.enter="handleLogin" class="login-form">
            <!-- Email Input -->
            <div class="form-group">
              <label>Endereço de email</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Insira seu e-mail..."
                  @blur="validateEmail"
                  autocomplete="email"
                  inputmode="email"
                  required
                ></ion-input>
              </div>
              <ion-text v-if="emailError" class="error-message">{{ emailError }}</ion-text>
            </div>

            <!-- Password Input -->
            <div class="form-group">
              <label>Senha</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="Insira sua senha..."
                  @blur="validatePassword"
                  autocomplete="current-password"
                  required
                ></ion-input>
                <div @click="showPassword = !showPassword" class="toggle-password">
                  <ion-icon :icon="showPassword ? eyeOffOutline : eyeOutline"></ion-icon>
                </div>
              </div>
              <ion-text v-if="passwordError" class="error-message">{{ passwordError }}</ion-text>
            </div>

            <!-- Remember Me -->
            <div class="remember-section">
              <div class="remember-checkbox">
                <ion-checkbox v-model="rememberMe"></ion-checkbox>
                <span>Lembrar</span>
              </div>

              <router-link to="/forgot-password" class="forgot-link">
                Esqueceu sua senha?
              </router-link>
            </div>

            <!-- Login Button -->
            <button type="submit" :disabled="isLoading || !isValidForm" class="submit-button">
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span>{{ isLoading ? 'Entrando...' : 'Entrar' }}</span>
            </button>

            <!-- Sign Up Link -->
            <div class="signup-container">
              <p>
                Não tem uma conta?
                <router-link to="/signup" class="signup-link"> Inscrever-se </router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </ion-content>

    <!-- Toast para exibir mensagens de erro -->
    <ion-toast
      :is-open="toast.show"
      :message="toast.message"
      :color="toast.color"
      :duration="3000"
      @didDismiss="toast.show = false"
    ></ion-toast>
  </ion-page>
</template>

<style lang="scss">
@import '@/theme/login.scss';
</style>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuth } from '@/composables/useAuth';
import {
  IonPage,
  IonContent,
  IonInput,
  IonText,
  IonSpinner,
  IonToast,
  IonCheckbox,
  IonIcon,
} from '@ionic/vue';
import { eyeOutline, eyeOffOutline } from 'ionicons/icons';

// Use auth composable
const {
  email,
  password,
  emailError,
  passwordError,
  showPassword,
  rememberMe,
  toast,
  isLoading,
  isValidForm,
  login,
  validateEmail,
  validatePassword,
  initialize,
} = useAuth();

// Initialize component
onMounted(() => {
  initialize();
});

// Handle form submission
const handleLogin = async () => {
  await login();
};
</script>
