<template>
  <div class="transaction-info">
    <ion-icon
      :icon="transactionIcon"
      class="transaction-icon"
    ></ion-icon>
    <div class="transaction-text">
      <div class="transaction-header">
        <h4 class="transaction-type">
          {{ transaction.tipo }}
          <span
            :class="[
              'transaction-amount',
              transactionClass,
            ]"
          >
            {{ formatCurrency(transaction.valor) }}
          </span>
        </h4>
      </div>
      <p class="transaction-description">Qtd: {{ formatDescricao(transaction.descricao) }}</p>
      <p class="transaction-date">
        <ion-icon :icon="timeOutline" class="date-icon"></ion-icon>
        {{ formatDate(transaction.data) }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  arrowBackCircleOutline,
  arrowForwardCircleOutline,
  timeOutline,
} from 'ionicons/icons';

interface Transaction {
  id: string;
  tipo: string;
  descricao?: string;
  valor: number;
  data: string;
}

const props = defineProps<{
  transaction: Transaction;
}>();

const transactionIcon = computed(() => {
  return props.transaction.tipo?.toLowerCase() === 'venda'
    ? arrowBackCircleOutline
    : arrowForwardCircleOutline;
});

const transactionClass = computed(() => {
  return props.transaction.tipo?.toLowerCase() === 'venda' ? 'income' : 'expense';
});

const formatDate = (dateString: string) => {
  if (!dateString) return 'Data inválida';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) {
    return 'Data inválida';
  }
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleDateString('pt-BR', options).replace(',', ' às');
};

const formatCurrency = (value: number) => {
  if (typeof value !== 'number') return 'R$ 0,00';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
};

const formatDescricao = (descricao?: string) => {
  if (!descricao) return '';
  return descricao.replace(/cota[s]?/gi, '').trim();
};
</script>
