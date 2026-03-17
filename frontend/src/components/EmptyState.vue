<template>
  <div class="empty-state">
    <ion-icon :icon="icon" class="empty-icon" />
    <p class="empty-message">{{ message }}</p>
    <ion-button v-if="actionLabel" @click="$emit('action')">
      {{ actionLabel }}
    </ion-button>
  </div>
</template>

<script setup lang="ts">
import { IonIcon, IonButton } from '@ionic/vue';

defineProps<{
  icon: string;
  message: string;
  actionLabel?: string;
}>();

defineEmits<{
  (e: 'action'): void;
}>();
</script>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}
.empty-icon {
  font-size: 4rem;
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}
.empty-message {
  color: var(--ion-color-medium);
  margin-bottom: 1rem;
}
</style>
