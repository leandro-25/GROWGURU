<template>
  <ion-page class="splash-page">
    <ion-content>
      <div class="splash-container">
        <div class="logo-wrapper">
          <img src="@/assets/imagem/logo.png" alt="GrowGuru" class="logo" />
        </div>
        <h2 class="title">Bem-vindo</h2>
        <LoadingSpinner message="Carregando..." />
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { IonPage, IonContent } from '@ionic/vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  // Tempo que a tela de splash será exibida (3 segundos)
  setTimeout(() => {
    // Redireciona para a tela de login após o tempo definido
    router.replace('/login');
  }, 3000);
});
</script>

<style scoped lang="scss">
@import '@/theme/splash.scss';
</style>
