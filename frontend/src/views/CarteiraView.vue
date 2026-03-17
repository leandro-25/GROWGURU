<template>
  <ion-page class="carteira-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="header-container">
          <div class="logo-container">
            <img src="@/assets/imagem/logoP.png" alt="Logo" class="logo-image" />
          </div>
          <div class="brand-text centered">
            <span class="brand-bold">Carteira</span>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <!-- Estado de carregamento -->
      <LoadingSpinner v-if="isLoading" message="Carregando sua carteira..." />

      <!-- Conteúdo principal -->
      <div v-else>
        <!-- Resumo da carteira -->
        <div class="resumo-container">
          <div class="valor-total">
            <h2>Valor Total</h2>
            <p class="valor">{{ formatCurrency(totalPortfolioValue) }}</p>
          </div>
        </div>

        <!-- Gráfico de Distribuição -->
        <div v-if="carteira.length > 0" class="chart-section">
          <div class="chart-container">
            <canvas ref="chartRef" id="carteira-chart" style="width: 100%; height: 300px"></canvas>
          </div>
          <!-- Carrossel de Legenda -->
          <div
            class="carousel-container"
            @mouseenter="pararCarrossel"
            @mouseleave="retomarCarrossel"
            @touchstart="toqueInicio"
            @touchend="toqueFim"
          >
            <div class="legend-container" :class="{ paused: carrosselPausado }">
              <div
                v-for="(item, index) in legendasDuplicadas"
                :key="`${index}-${item.nome}`"
                class="legend-item"
              >
                <div
                  class="legend-icon"
                  :class="`legend-icon-${(carteira.findIndex(i => i.nome === item.nome) % 20) + 1}`"
                  :style="{ backgroundColor: item.cor }"
                ></div>
                <span class="legend-text">{{ item.nome }}</span>
              </div>
            </div>
          </div>
        </div>

        <EmptyState
          v-else
          icon="wallet-outline"
          message="Nenhum investimento encontrado"
          action-label="Adicionar Investimento"
          @action="irParaInvestir"
        />

        <!-- Lista de Estratégias -->
        <!-- Modern Strategy List -->
        <div v-if="carteira.length > 0" class="modern-strategy-list">
          <div
            v-for="estrategia in carteira"
            :key="estrategia.id"
            class="strategy-card"
            :class="{ expanded: estrategia.aberto }"
            v-memo="[estrategia.id, estrategia.aberto, estrategia.total_investido]"
          >
            <!-- Strategy Header -->
            <div class="strategy-header" @click="toggleDetalhes(estrategia.id)">
              <div class="strategy-header-content">
                <!--<div class="strategy-icon">
                  <ion-icon :name="estrategia.aberto ? 'folder-open' : 'folder'" class="folder-icon"></ion-icon>
                </div>-->
                <div class="strategy-info">
                  <h3 class="strategy-name">{{ estrategia.nome }}</h3>
                  <div class="strategy-meta">
                    <span class="strategy-percentage">{{ estrategia.porcentagem }}%</span>
                    <span class="strategy-value">{{
                      formatCurrency(estrategia.total_investido)
                    }}</span>
                  </div>
                </div>
                <!--<ion-icon :icon="estrategia.aberto ? chevronDown : chevronForward" class="toggle-arrow"></ion-icon>-->
              </div>

              <!-- Progress Bar -->
              <div class="progress-container">
                <div class="progress-bar" :style="{ width: `${estrategia.porcentagem}%` }"></div>
              </div>
            </div>

            <!-- Assets List (Visible when expanded) -->
            <transition name="slide-fade">
              <div v-if="estrategia.aberto" class="assets-container">
                <div
                  v-for="ativo in estrategia.ativos"
                  :key="ativo.codigo"
                  class="asset-card"
                  v-memo="[ativo.codigo, ativo.quantidade, ativo.valor_medio, ativo.preco_atual]"
                >
                  <!-- Asset Header -->
                  <div class="asset-header">
                    <div class="asset-symbol">
                      <span class="symbol-badge">{{ ativo.codigo }}</span>
                      <span
                        class="profit-badge"
                        :class="{
                          profit: parseFloat(calculateProfit(ativo)) >= 0,
                          loss: parseFloat(calculateProfit(ativo)) < 0,
                        }"
                      >
                        {{ calculateProfit(ativo) }}%
                      </span>
                    </div>
                    <div class="asset-value">
                      {{ formatCurrency(ativo.quantidade * ativo.valor_medio) }}
                    </div>
                  </div>

                  <!-- Asset Details Grid -->
                  <div class="asset-details">
                    <!-- First Row -->
                    <div class="detail-item">
                      <!--<ion-icon name="calculator-outline" class="detail-icon"></ion-icon>-->
                      <div class="detail-content">
                        <span class="detail-label">Quantidade</span>
                        <span class="detail-value">{{ ativo.quantidade }} un</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <!--<ion-icon name="pricetag-outline" class="detail-icon"></ion-icon>-->
                      <div class="detail-content">
                        <span class="detail-label">Preço Médio</span>
                        <span class="detail-value">{{ formatCurrency(ativo.valor_medio) }}</span>
                      </div>
                    </div>
                    <!-- Second Row -->
                    <div class="detail-item">
                      <!--<ion-icon name="trending-up-outline" class="detail-icon"></ion-icon>-->
                      <div class="detail-content">
                        <span class="detail-label">Valor Atual</span>
                        <span class="detail-value">{{
                          formatCurrency(ativo.preco_atual || ativo.valor_medio)
                        }}</span>
                      </div>
                    </div>
                    <div class="detail-item">
                      <!--<ion-icon name="wallet-outline" class="detail-icon"></ion-icon>-->
                      <div class="detail-content">
                        <span class="detail-label">Total Investido</span>
                        <span class="detail-value">{{
                          formatCurrency(ativo.quantidade * ativo.valor_medio)
                        }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Sell Action -->
                  <div class="asset-actions">
                    <div class="action-inputs">
                      <div class="input-group">
                        <label>Quantidade</label>
                        <ion-input
                          v-model.number="ativo.quantidadeVenda"
                          type="number"
                          :min="0"
                          :max="ativo.quantidade"
                          placeholder="0"
                          class="modern-input"
                          @ionInput="checkVendaButton(ativo)"
                        ></ion-input>
                      </div>
                      <div class="input-group">
                        <label>Preço Unitário</label>
                        <ion-input
                          v-model.number="ativo.precoVenda"
                          type="number"
                          :min="0"
                          step="0.01"
                          :placeholder="formatCurrency(ativo.valor_medio || 0)"
                          class="modern-input"
                          @ionInput="checkVendaButton(ativo)"
                        ></ion-input>
                      </div>
                    </div>
                    <ion-button
                      @click.stop="venderAtivo(ativo, estrategia.id)"
                      expand="block"
                      class="sell-button"
                      color="warning"
                      :disabled="isProcessing"
                    >
                      {{ isProcessing ? 'Processando...' : 'Vender Ativo' }}
                    </ion-button>
                  </div>
                </div>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, nextTick, watch, onActivated, ref } from 'vue';
import { useCarteira } from '@/composables/useCarteira';
import { logger } from '@/utils/logger';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import {
  IonButton,
  IonInput,
  IonLabel,
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonItemGroup,
  IonIcon,
  IonButtons,
  IonBackButton,
} from '@ionic/vue';

// Local refs for chart
const chartRef = ref<HTMLCanvasElement | null>(null);

// Use carteira composable with refs
const {
  carteira,
  isLoading,
  carrosselPausado,

  totalPortfolioValue,
  formatCurrency,
  calculateProfit,
  showToast,
  toggleDetalhes,
  venderAtivo,
  isProcessing,
  irParaInvestir,
  atualizarGrafico,
  iniciarCarrossel,
  pararCarrossel,
  retomarCarrossel,
  toqueInicio,
  toqueFim,
  loadPortfolio,
  initialize,
  cleanup,
  legendasDuplicadas,
} = useCarteira(chartRef);

// Função para verificar estado do botão
const checkVendaButton = (ativo: any) => {
  // Força reatividade e conversão
  const valorQtd = parseFloat(ativo.quantidadeVenda) || 0;
  const valorPreco = parseFloat(ativo.precoVenda) || 0;

  // Força atualização reativa
  ativo.quantidadeVenda = valorQtd;
  ativo.precoVenda = valorPreco;

  // Força re-renderização
  nextTick();
};

// Component lifecycle
onMounted(async () => {
  logger.debug('CarteiraView mounted - initializing...');
  await initialize();
});

onActivated(async () => {
  // Force refresh when page is activated
  logger.debug('CarteiraView activated - reloading portfolio...');
  await initialize();
});

window.addEventListener('carteira-atualizada', async () => {
  logger.debug('Portfolio updated - reloading...');
  await initialize();
});

// Watch for changes in carteira length to update chart
watch(
  () => carteira.value.length,
  (newLen, oldLen) => {
    if (newLen !== oldLen && newLen > 0) {
      nextTick(async () => {
        await atualizarGrafico();
        iniciarCarrossel();
      });
    }
  }
);

// Watch for changes in totalPortfolioValue
watch(
  totalPortfolioValue,
  (newValue, oldValue) => {
    if (newValue !== oldValue) {
      logger.debug('Portfolio value changed:', {
        oldValue: oldValue || 0,
        newValue: newValue || 0,
      });
    }
  },
  { immediate: true }
);

onBeforeUnmount(() => {
  // Remover event listener
  window.removeEventListener('carteira-atualizada', () => {});
  cleanup();
});
</script>

<style lang="scss">
@import '@/theme/carteira.scss';
</style>
