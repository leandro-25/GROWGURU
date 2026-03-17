<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet></ion-router-outlet>
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="home" href="/tabs/home">
          <ion-icon :icon="homeOutline"></ion-icon>
          <!--<ion-label>Início</ion-label>-->
        </ion-tab-button>

        <ion-tab-button tab="estrategias" href="/tabs/estrategias">
          <ion-icon :icon="analyticsOutline"></ion-icon>
          <!--<ion-label>Estratégias</ion-label>-->
        </ion-tab-button>

        <ion-tab-button tab="carteira" href="/tabs/carteira">
          <ion-icon :icon="cardOutline"></ion-icon>
          <!--<ion-label>Carteira</ion-label>-->
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup>
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonPage,
  IonRouterOutlet,
} from '@ionic/vue';
import { homeOutline, analyticsOutline, cardOutline } from 'ionicons/icons';
</script>

<style scoped>
ion-tab-bar {
  --background: #111827; /* Fundo Principal */
  --color: #f9fafb; /* Texto Principal */
  --border-color: #374151; /* Divisores e Bordas */
  padding: 5px 0;
  height: 60px;
}

ion-tab-button {
  --color: #a0aec0; /* Cor padrão do ícone/label (cinza claro) */
  --color-selected: #f59e0b; /* Acentos e Destaques (Âmbar) */
  --background-focused: rgba(245, 158, 11, 0.1); /* Fundo sutil ao focar */
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
  background: #f59e0b;
  transition: transform 0.3s ease;
  border-radius: 0 0 4px 4px;
}

/* A classe tab-selected é adicionada automaticamente pelo Ionic quando href corresponde à rota */
ion-tab-button.tab-selected::before {
  transform: translateX(-50%) scaleX(1);
}

ion-label {
  font-size: 0.75rem;
  margin-top: 4px;
}

ion-icon {
  font-size: 1.25rem;
}
</style>
