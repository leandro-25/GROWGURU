<template>
  <ion-app>
    <ErrorBoundary>
      <Suspense>
        <ion-router-outlet />
        <template #fallback>
          <div class="suspense-loading">
            <ion-spinner name="circular"></ion-spinner>
            <p>Carregando...</p>
          </div>
        </template>
      </Suspense>
    </ErrorBoundary>
    <GlobalLoading :visible="isLoading" message="Processando..." />
  </ion-app>
</template>

<script setup lang="ts">
import { IonApp, IonRouterOutlet, IonSpinner } from '@ionic/vue';
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { App } from '@capacitor/app';
import ErrorBoundary from '@/components/ErrorBoundary.vue';
import GlobalLoading from '@/components/GlobalLoading.vue';
import { logger } from '@/utils/logger';

const router = useRouter();
const isLoading = ref(false);

const setupDeepLinks = () => {
  const handlePasswordReset = (url: string) => {
    logger.debug('Processing password reset URL:', url);

    const tokenMatch = url.match(/access_token=([^&]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    if (token) {
      logger.debug('Token extracted:', token);
      router.push(`/reset-password#access_token=${token}&type=recovery`);
      return true;
    }
    return false;
  };

  App.addListener('appUrlOpen', (data: { url: string }) => {
    logger.debug('App opened with URL:', data.url);

    if (data.url.includes('reset-password')) {
      handlePasswordReset(data.url);
    }
  });

  App.getLaunchUrl().then(ret => {
    if (ret?.url) {
      logger.debug('App opened via link:', ret.url);
      if (ret.url.includes('reset-password')) {
        handlePasswordReset(ret.url);
      }
    }
  });
};

onMounted(() => {
  setupDeepLinks();

  App.getLaunchUrl().then(ret => {
    if (ret && ret.url) {
      logger.debug('App opened via link:', ret.url);
      if (ret.url.includes('reset-password')) {
        const url = new URL(ret.url);
        const token = url.hash.split('=')[1];
        if (token) {
          router.push(`/reset-password#access_token=${token}&type=recovery`);
        } else {
          router.push('/reset-password');
        }
      }
    }
  });
});
</script>

<style scoped>
.suspense-loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  gap: 1rem;
}

.suspense-loading p {
  color: var(--ion-color-medium);
}
</style>
