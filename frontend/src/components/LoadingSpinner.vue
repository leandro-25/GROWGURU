<template>
  <div class="loading-spinner">
    <ion-spinner :name="spinnerName" />
    <p v-if="message">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { IonSpinner } from '@ionic/vue';

type SpinnerName = 'circular' | 'bubbles' | 'circles' | 'crescent' | 'dots' | 'lines' | 'lines-small' | 'lines-sharp' | 'lines-sharp-small';

withDefaults(
  defineProps<{
    message?: string;
    spinnerName?: SpinnerName;
  }>(),
  {
    message: '',
    spinnerName: 'crescent',
  }
);
</script>

<style scoped>
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}
</style>
