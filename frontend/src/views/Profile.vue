<template>
  <ion-page class="profile-page">
    <ion-content class="h-screen overflow-hidden" :scroll-y="false">
      <div class="profile-container">
        <div class="profile-box">
          <div class="logo-wrapper">
            <img src="@/assets/imagem/logo.png" alt="GrowGuru" />
          </div>
          <div class="title-section">
            <h1 class="profile-title">Editar Perfil</h1>
          </div>

          <form @submit.prevent="updateProfile" class="profile-form">
            <!-- Nome -->
            <div class="form-group">
              <label>Nome</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="nome"
                  type="text"
                  placeholder="Digite seu nome"
                  required
                ></ion-input>
              </div>
            </div>

            <!-- Nova Senha -->
            <div class="form-group">
              <label>Nova Senha (opcional)</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="novaSenha"
                  :type="showNewPassword ? 'text' : 'password'"
                  placeholder="Digite a nova senha"
                ></ion-input>
                <div @click="toggleNewPassword" class="toggle-password">
                  <ion-icon :icon="showNewPassword ? eyeOffOutline : eyeOutline"></ion-icon>
                </div>
              </div>
            </div>

            <!-- Confirmar Nova Senha -->
            <div class="form-group">
              <label>Confirmar Nova Senha</label>
              <div class="input-wrapper">
                <ion-input
                  v-model="confirmarNovaSenha"
                  :type="showConfirmNewPassword ? 'text' : 'password'"
                  placeholder="Confirme a nova senha"
                ></ion-input>
                <div @click="toggleConfirmNewPassword" class="toggle-password">
                  <ion-icon :icon="showConfirmNewPassword ? eyeOffOutline : eyeOutline"></ion-icon>
                </div>
              </div>
            </div>

            <!-- Botão de Atualizar -->
            <button type="submit" class="submit-button" :disabled="loading">
              <ion-spinner v-if="loading" name="crescent"></ion-spinner>
              <span>{{ loading ? 'Atualizando...' : 'Atualizar Perfil' }}</span>
            </button>

            <!-- Botão Voltar -->
            <button type="button" @click="goBack" class="back-button-outline">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Voltar</span>
            </button>
          </form>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useProfile } from '@/composables/useProfile';
import { eyeOutline, eyeOffOutline, arrowBackOutline } from 'ionicons/icons';
import { IonPage, IonContent, IonInput, IonIcon, IonSpinner } from '@ionic/vue';

// Use profile composable
const {
  loading,
  showNewPassword,
  showConfirmNewPassword,
  nome,
  novaSenha,
  confirmarNovaSenha,
  goBack,
  toggleNewPassword,
  toggleConfirmNewPassword,
  updateProfile,
  initialize,
} = useProfile();

// Component lifecycle
onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
@import '@/theme/profile.scss';
</style>
