<template>
  <ion-page class="home-page">
    <ion-content
      ref="content"
      class="ion-padding"
      :scroll-events="true"
      @ionRefresh="handleRefresh($event)"
      :fullscreen="true"
    >
      <!-- Meta viewport para melhor responsividade -->
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, viewport-fit=cover, maximum-scale=1.0, user-scalable=no"
      />
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          refreshing-spinner="circles"
        ></ion-refresher-content>
      </ion-refresher>

      <LoadingSpinner v-if="isLoading" message="Carregando..." />

      <div class="content-container" :class="{ 'content-loading': isLoading }">
        <div class="brand-container">
          <div class="logo-container">
            <img src="@/assets/imagem/logoP.png" alt="Logo" class="logo-image" />
            <div class="brand-text"><span class="brand-bold">Grow</span>Guru</div>
          </div>
          <button @click="openProfileMenu" class="profile-button-top">
            <ion-icon :icon="personOutline" class="profile-icon"></ion-icon>
          </button>

          <!-- Menu de botões flutuantes -->
          <div v-if="profileMenuOpen" class="floating-menu">
            <div class="floating-menu-backdrop" @click="profileMenuOpen = false"></div>
            <div class="floating-menu-buttons">
              <button class="floating-menu-button" @click="goToProfile">
                <ion-icon :icon="personOutline" class="menu-icon"></ion-icon>
                <span>Meu Perfil</span>
              </button>
              <button class="floating-menu-button logout-button" @click="logout">
                <ion-icon :icon="logOutOutline" class="menu-icon"></ion-icon>
                <span>Sair</span>
              </button>
            </div>
          </div>
        </div>

        <div class="balance-card">
          <div class="card-content">
            <div class="user-info">
              <h2 class="user-name">Olá {{ userName }}</h2>
              <!--<p class="account-date">Conta desde {{ formatDateShort(userCreatedAt) }}</p>-->
            </div>
            <div class="balance-info">
              <div class="balance-row">
                <div class="balance-item">
                  <p class="balance-label">Rentabilidade</p>
                  <p :class="['balance-value', rentabilidadeClasse]">
                    {{ rentabilidadePercentual }}%
                  </p>
                </div>
                <div class="balance-item">
                  <p class="balance-label">Total investido</p>
                  <p class="balance-value">R$ {{ totalInvestido.toFixed(2) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="card-decoration"></div>
          <img src="@/assets/imagem/visa.png" alt="Visa Logo" class="card-logo" />
        </div>

        <div class="transactions-section">
          <div class="section-header">
            <h3 class="section-title">Transações recentes</h3>
            <button class="see-more" @click="openTransactionsModal">Ver mais</button>
          </div>
          <div class="transactions-list">
            <EmptyState
              v-if="visibleTransactions.length === 0"
              icon="receipt-outline"
              message="Nenhuma transação encontrada"
            />
            <div
              v-for="(transacao, index) in visibleTransactions"
              :key="transacao.id"
              class="transaction-item"
              :style="{ '--index': index }"
            >
              <div class="transaction-info">
                <ion-icon
                  :icon="
                    transacao.tipo.toLowerCase() === 'venda'
                      ? arrowBackCircleOutline
                      : arrowForwardCircleOutline
                  "
                  color="warning"
                  class="transaction-icon"
                  style="font-size: 32px; width: 32px; height: 32px; --ionicon-stroke-width: 32px"
                >
                </ion-icon>
                <div class="transaction-text">
                  <h4 class="transaction-type">
                    {{ transacao.tipo }}
                  </h4>
                  <p class="transaction-description">Qtd: {{ formatDescricao(transacao.descricao) }}</p>
                  <p class="transaction-date">{{ formatDate(transacao.data) }}</p>
                </div>
              </div>
              <span
                :class="[
                  'transaction-amount',
                  transacao.tipo.toLowerCase() === 'venda' ? 'income' : 'expense',
                ]"
              >
                R$ {{ transacao.valor.toFixed(2) }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Botão Flutuante (FAB) removido conforme solicitado -->

      <!-- Adicionando um rodapé para melhorar a experiência em dispositivos com notch -->
      <div class="safe-area-spacer"></div>
    </ion-content>
    <!-- Modal de Transações -->
    <TransactionsModal
      :isOpen="isTransactionsModalOpen"
      :transactions="allTransactions"
      @update:isOpen="isTransactionsModalOpen = $event"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, nextTick, watch, onActivated } from 'vue';
import { useHomePage } from '@/composables/useHomePage';
import { useRentabilidade } from '@/composables/useRentabilidade';
import TransactionsModal from '@/views/TransactionsModal.vue';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import { logger } from '@/utils/logger';
import {
  IonPage,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  toastController,
} from '@ionic/vue';
import {
  logOutOutline,
  arrowForwardCircleOutline,
  arrowBackCircleOutline,
  personOutline,
} from 'ionicons/icons';

// Use home page composable
const {
  isLoading,
  userName,
  saldo,
  totalInvestido,
  visibleTransactions,
  allTransactions,
  content,
  profileMenuOpen,
  isTransactionsModalOpen,
  handleRefresh,
  openProfileMenu,
  goToProfile,
  logout,
  openTransactionsModal,
  formatDate,
  initialize,
  cleanup,
} = useHomePage();

// Use rentabilidade composable
const { rentabilidadePercentual, rentabilidadeClasse } = useRentabilidade(totalInvestido, saldo);

const formatDescricao = (descricao?: string) => {
  if (!descricao) return '';
  return descricao.replace(/cota[s]?/gi, '').trim();
};

// Component lifecycle
onMounted(() => {
  logger.debug('HomePage mounted - initializing...');
  initialize();
});

onActivated(() => {
  // Force refresh when page is activated
  logger.debug('HomePage activated - reloading...');
  initialize();
});

// Watch for changes in totalInvestido
watch(
  () => totalInvestido.value,
  (newValue, oldValue) => {
    logger.debug('Total invested changed:', { oldValue, newValue });
  },
  { immediate: true }
);

onUnmounted(() => {
  cleanup();
});
</script>

<style lang="scss">
@use '@/theme/homepage';
</style>
