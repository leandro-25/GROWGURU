<template>
  <ion-page class="forgot-password-page">
    <ion-content class="h-screen overflow-hidden" :scroll-y="false">
      <div class="forgot-password-container">
        <div class="forgot-password-box">
          <div class="logo-wrapper">
            <img src="@/assets/imagem/logo.png" alt="GrowGuru" />
          </div>
          <h1 class="title">Recuperar Senha</h1>

          <form @submit.prevent="sendRecoveryLink" class="forgot-password-form">
            <div class="form-group">
              <label>Email</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="email"
                  type="email"
                  placeholder="Digite seu email"
                  required
                ></ion-input>
              </div>
              <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
            </div>

            <button type="submit" class="submit-button" :disabled="isLoading">
              <ion-spinner v-if="isLoading" name="crescent"></ion-spinner>
              <span>{{ isLoading ? 'Enviando...' : 'Enviar Link de Recuperação' }}</span>
            </button>

            <div class="back-to-login">
              <p>
                Lembrou sua senha?
                <router-link to="/login" @click="goToLogin" class="login-link">
                  Faça login
                </router-link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { useForgotPassword } from '@/composables/useForgotPassword';
import { IonPage, IonContent, IonInput, IonSpinner } from '@ionic/vue';

// Use forgot password composable
const { isLoading, errorMessage, email, sendRecoveryLink, goToLogin } = useForgotPassword();
</script>

<style lang="scss" scoped>
@import '@/theme/forgot-password.scss';

ion-item {
  --background: transparent;
  --border-color: transparent;
  --highlight-height: 0;
  --padding-start: 0;
  --padding-end: 0;
  --inner-padding-end: 0;
  margin-bottom: 1rem;
}

ion-item::part(native) {
  padding: 0;
  background: transparent;
}

ion-input {
  --padding-start: 1rem;
  --padding-end: 1rem;
  --padding-top: 0.75rem;
  --padding-bottom: 0.75rem;
  --placeholder-color: #9ca3af;
  --background: rgba(31, 41, 55, 0.5);
}

ion-input.ion-focused {
  --background: rgba(31, 41, 55, 0.5);
}
</style>
