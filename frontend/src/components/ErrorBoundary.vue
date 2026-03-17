<template>
  <div v-if="error" class="error-boundary">
    <div class="error-content">
      <ion-icon :icon="alertCircleOutline" class="error-icon"></ion-icon>
      <h2>Algo deu errado</h2>
      <p>{{ error.message }}</p>
      <ion-button @click="retry">Tentar novamente</ion-button>
    </div>
  </div>
  <slot v-else />
</template>

<script setup lang="ts">
import { ref, onErrorCaptured } from 'vue';
import { IonButton, IonIcon } from '@ionic/vue';
import { alertCircleOutline } from 'ionicons/icons';
import { logger } from '@/utils/logger';

const error = ref<Error | null>(null);

onErrorCaptured(err => {
  error.value = err;
  logger.error('Error captured:', err);
  return false;
});

const retry = () => {
  error.value = null;
  window.location.reload();
};
</script>

<style scoped>
.error-boundary {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  text-align: center;
}

.error-content {
  max-width: 400px;
}

.error-icon {
  font-size: 4rem;
  color: var(--ion-color-danger);
  margin-bottom: 1rem;
}

.error-boundary h2 {
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
  color: var(--ion-color-dark);
}

.error-boundary p {
  color: var(--ion-color-medium);
  margin-bottom: 1.5rem;
}
</style>
