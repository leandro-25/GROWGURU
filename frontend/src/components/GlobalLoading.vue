<template>
  <div class="loading-overlay" v-if="visible">
    <div class="loading-content">
      <ion-spinner name="circular" class="loading-spinner"></ion-spinner>
      <p v-if="message">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

defineProps<{
  visible: boolean;
  message?: string;
}>();
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  color: var(--ion-color-primary);
}

.loading-content p {
  color: var(--ion-color-medium);
  font-size: 0.9rem;
}
</style>
