<template>
  <ion-page class="estrategias-page">
    <ion-header class="ion-no-border">
      <ion-toolbar>
        <div class="header-container">
          <div class="logo-container">
            <img src="@/assets/imagem/logoP.png" alt="Logo" class="logo-image" />
          </div>
          <div class="brand-text centered">
            <span class="brand-bold">Estratégias</span>
          </div>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content ref="content" class="ion-padding" :scroll-events="true">
      <!-- Filtro de Tipo de Estratégia -->
      <div class="filtro-container">
        <ion-select
          v-model="typeFilter"
          placeholder="Filtrar por tipo"
          interface="action-sheet"
          class="filtro-select"
          @ionChange="applyFilter"
        >
          <ion-select-option value="">Todas as estratégias</ion-select-option>
          <ion-select-option v-for="tipo in strategyTypes" :key="tipo" :value="tipo">
            {{ tipo }}
          </ion-select-option>
        </ion-select>
      </div>
      <ion-refresher slot="fixed" @ionRefresh="handleRefresh($event)">
        <ion-refresher-content
          pulling-icon="chevron-down-circle-outline"
          refreshing-spinner="circles"
        ></ion-refresher-content>
      </ion-refresher>

      <!-- Loading State -->
      <LoadingSpinner v-if="loading" message="Carregando..." />

      <div class="content-container" :class="{ 'content-loading': loading }">
        <!-- Empty State -->
        <EmptyState
          v-if="!loading && !strategies.length"
          icon="document-text-outline"
          message="Nenhuma estratégia encontrada"
        />
        <div class="estrategias-grid">
          <div
            v-for="estrategia in filteredStrategies"
            :key="estrategia.id"
            class="estrategia-card"
            v-memo="[estrategia.id, estrategia.rentabilidade_media, estrategia.total_ativos]"
          >
            <div class="card-header">
              <div class="header-content">
                <h3 class="estrategia-nome">{{ estrategia.nome }}</h3>
              </div>
              <div class="estrategia-data">
                <ion-icon :icon="calendarOutline"></ion-icon>
                <span>{{ formatDate(estrategia.created_at || '') }}</span>
              </div>
            </div>

            <div class="card-content">
              <div class="descricao-container">
                <p class="estrategia-descricao">
                  <strong>Risco:</strong>
                  {{ estrategia.descricao || 'Nenhuma descrição fornecida' }}
                </p>
              </div>

              <div class="detalhes-container">
                <div class="metrica">
                  <div class="metrica-rotulo">
                    <div
                      class="metrica-icone"
                      :class="getRentabilidadeClass(estrategia.rentabilidade_media)"
                    >
                      <ion-icon :icon="trendingUpOutline"></ion-icon>
                    </div>
                    <span>Rentabilidade Média</span>
                  </div>
                  <span
                    class="metrica-valor"
                    :class="getRentabilidadeClass(estrategia.rentabilidade_media, true)"
                  >
                    {{ formatRentabilidade(estrategia.rentabilidade_media) }}
                  </span>
                </div>

                <div class="metrica">
                  <div class="metrica-rotulo">
                    <div class="metrica-icone">
                      <ion-icon :icon="briefcaseOutline"></ion-icon>
                    </div>
                    <span>Ativos Relacionados</span>
                  </div>
                  <span class="badge-ativos">
                    {{ estrategia.total_ativos || 0 }}
                  </span>
                </div>
              </div>
            </div>

            <div class="card-footer">
              <button class="botao-acao" @click.stop="viewDetails(estrategia.id)">
                <span>Ver Detalhes</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useEstrategias } from '@/composables/useEstrategias';
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import EmptyState from '@/components/EmptyState.vue';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonIcon,
  IonSelect,
  IonSelectOption,
} from '@ionic/vue';
import {
  calendarOutline,
  trendingUpOutline,
  briefcaseOutline,
  documentTextOutline,
} from 'ionicons/icons';

// Use estratégias composable
const {
  loading,
  typeFilter,
  strategyTypes,
  strategies,
  filteredStrategies,
  formatDate,
  formatRentabilidade,
  getRentabilidadeClass,
  viewDetails,
  handleRefresh,
  applyFilter,
  initialize,
} = useEstrategias();

// Component lifecycle
onMounted(() => {
  initialize();
});
</script>

<style lang="scss">
@use '@/theme/estrategias.scss';
</style>
