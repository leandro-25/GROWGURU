<template>
  <ion-page class="ativos-page">
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-header class="ion-no-border">
        <ion-toolbar>
          <div class="header-container">
            <div class="logo-container">
              <img src="@/assets/imagem/logoP.png" alt="Logo" class="logo-image" />
            </div>
            <div class="brand-text centered">
              <span class="brand-bold">{{ estrategiaNome }}</span>
            </div>
          </div>
        </ion-toolbar>
      </ion-header>

      <ion-content>

        <div class="content-container">
          <LoadingSpinner v-if="loading" message="Carregando ativos..." />

          <EmptyState 
            v-else-if="ativos.length === 0" 
            icon="alert-circle-outline"
            message="Nenhum ativo encontrado nesta estratégia"
          />

          <div class="cards-grid">
            <div v-for="(ativo, index) in ativos" :key="ativo.id" class="card-wrapper">
              <ion-card class="ativo-card" v-memo="[ativo.id, ativo.valorCompra, ativo.quantidade]">
                <div class="card-header">
                  <div class="asset-info">
                    <div class="asset-details">
                      <h3>{{ ativo.ativos.codigo }}</h3>
                      <span class="asset-type">{{ formatAssetType(ativo.ativos.tipo) }}</span>
                    </div>
                  </div>
                  <div class="header-actions">
                    <!--<ion-button fill="clear" size="small" class="news-button" @click="toggleNewsCard(ativo)">
                <ion-icon :icon="newspaperOutline" slot="icon-only"></ion-icon>
                <span class="button-label">Notícias</span>
              </ion-button>-->
                    <ion-badge class="position-badge">#{{ ativo.posicao }}</ion-badge>
                  </div>
                </div>
                <ion-card-content class="card-content">
                  <div class="form-row">
                    <ion-item class="form-input" style="--min-height: 80px;">
                      <ion-label position="floating"
                        style="font-size: 16px; --color: #F9FAFB; transform: none !important; margin-left: 0.1em;">Valor
                        Unitário</ion-label>
                      <ion-input :value="ativo.valorCompra" @ionChange="onValorChange($event, ativo)" type="number"
                        :placeholder="ativo.ativos.preco_atual.toFixed(2)" step="0.01" class="custom-input"></ion-input>
                    </ion-item>

                    <ion-item class="form-input">
                      <ion-label position="floating">Quantidade</ion-label>
                      <ion-input :value="ativo.quantidade" @ionChange="onQuantidadeChange($event, ativo)" type="number"
                        min="1" class="custom-input"></ion-input>
                    </ion-item>
                  </div>

                  <div class="total-section">
                    <span>Total</span>
                    <span class="total-amount">R$ {{ calculateTotal(ativo) }}</span>
                  </div>

                  <ion-button @click="adicionarCarteira(ativo)" expand="block" class="buy-button" :disabled="isProcessing">
                    <ion-icon :icon="addCircle" slot="start"></ion-icon>
                    {{ isProcessing ? 'Comprando...' : 'Adicionar à Carteira' }}
                  </ion-button>
                </ion-card-content>
              </ion-card>
            </div>
          </div>
        </div>
        <!-- Botão flutuante com menu de ações -->
        <div class="floating-actions">
          <button class="fab-button" @click="toggleActions">
            <ion-icon :icon="ellipsisVertical"></ion-icon>
          </button>

          <div class="action-buttons" :class="{ 'show-actions': showActions }">
            <button class="action-button" @click="handleRefreshAction">
              <ion-icon :icon="refreshOutline"></ion-icon>
              <span>Atualizar</span>
            </button>
            <button class="action-button" @click="goBack">
              <ion-icon :icon="arrowBackOutline"></ion-icon>
              <span>Voltar</span>
            </button>
          </div>
        </div>
      </ion-content>

      <ion-tab-bar slot="bottom" class="custom-tab-bar">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline"></ion-icon>
          <!--<ion-label>Início</ion-label>-->
        </ion-tab-button>

        <ion-tab-button tab="estrategias" href="/tabs/estrategias" class="estrategias-tab-selected">
          <ion-icon :icon="analyticsOutline"></ion-icon>
          <!--<ion-label>Estratégias</ion-label>-->
        </ion-tab-button>

        <ion-tab-button tab="carteira" href="/tabs/carteira">
          <ion-icon :icon="cardOutline"></ion-icon>
          <!--<ion-label>Carteira</ion-label>-->
        </ion-tab-button>
      </ion-tab-bar>

    </ion-tabs>

    <!-- Card flutuante de notícias -->
    <div v-if="showNewsCard" class="news-card-overlay" @click.self="showNewsCard = false">
      <div class="news-card">
        <div class="news-card-header">
          <h3>Notícias - {{ selectedAtivo?.ativos?.codigo }}</h3>
          <ion-button fill="clear" @click="showNewsCard = false">
            <ion-icon :icon="closeOutline"></ion-icon>
          </ion-button>
        </div>
        <div class="news-card-content">
          <LoadingSpinner v-if="loadingNews" message="Buscando notícias..." />
          <div v-else>
            <div class="impact-badge" :class="'impact-' + newsImpact">
              {{ newsImpact === 'positivo' ? 'Positivo' : newsImpact === 'negativo' ? 'Negativo' : 'Neutro' }}
            </div>
            <p>{{ newsContent }}</p>
          </div>
        </div>
      </div>
    </div>

  </ion-page>
</template>


<script setup lang="ts">
import { onMounted } from 'vue';
import { useAtivosEstrategia } from '@/composables/useAtivosEstrategia';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import {
  IonPage, IonHeader, IonToolbar, IonTitle, IonContent,
  IonCard, IonCardContent, IonItem, IonLabel, IonInput,
  IonButton, IonIcon, IonBadge,
  IonTabs, IonTabBar, IonTabButton
} from '@ionic/vue';
import {
  addCircle, alertCircleOutline, ellipsisVertical,
  homeOutline, analyticsOutline, cardOutline,
  refreshOutline, arrowBackOutline, closeOutline
} from 'ionicons/icons';

// Use ativos estratégia composable
const {
  loading,
  showActions,
  showNewsCard,
  selectedAtivo,
  loadingNews,
  newsContent,
  newsImpact,
  estrategiaNome,
  ativos,
  formatAssetType,
  calculateTotal,
  toggleActions,
  toggleNewsCard,
  handleRefreshAction,
  goBack,
  onValorChange,
  onQuantidadeChange,
  adicionarCarteira,
  isProcessing,
  initialize
} = useAtivosEstrategia();

// Component lifecycle
onMounted(() => {
  initialize();
});
</script>

<style lang="scss" scoped>
@import '@/theme/ativos-estrategia.scss';

/* Estilo da tab bar para ficar igual ao TabsLayout.vue */
ion-tab-bar {
  --background: #111827;
  /* Fundo Principal */
  --color: #F9FAFB;
  /* Texto Principal */
  --border-color: #374151;
  /* Divisores e Bordas */
  padding: 5px 0;
  height: 60px;
}

ion-tab-button {
  --color: #a0aec0;
  /* Cor padrão do ícone/label (cinza claro) */
  --color-selected: #F59E0B;
  /* Acentos e Destaques (Âmbar) */
  --background-focused: rgba(245, 158, 11, 0.1);
  /* Fundo sutil ao focar */
  position: relative;
  overflow: visible;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  padding-top: 6px;
  height: 100%;
}

ion-tab-button::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%) scaleX(0);
  width: 50%;
  height: 3px;
  background: #F59E0B;
  transition: transform 0.3s ease;
  border-radius: 0 0 4px 4px;
}

/* Estilo para a tab ativa */
ion-tab-button.tab-selected::before {
  transform: translateX(-50%) scaleX(1);
}
</style>
