<template>
  <ion-modal
    :is-open="isOpen"
    @didDismiss="closeModal"
    class="transactions-modal"
    :backdrop-dismiss="true"
    :can-dismiss="true"
  >
    <div class="modal-header">
      <h2 class="modal-title">Minhas Transações</h2>
      <button class="close-button" @click="closeModal">
        <ion-icon :icon="closeOutline"></ion-icon>
      </button>
    </div>

    <ion-content class="transactions-content" @ionScroll="handleScroll">
      <EmptyState
        v-if="!transactions || transactions.length === 0"
        icon="receipt-outline"
        message="Nenhuma transação encontrada"
      />

      <div
        v-else
        class="transactions-list"
      >
        <div
          v-for="(transacao, index) in visibleTransactions"
          :key="transacao.id || index"
          class="transaction-item"
        >
          <TransactionItem :transaction="transacao" />
        </div>
        
        <div v-if="isLoadingMore" class="loading-more">
          <ion-spinner name="circular"></ion-spinner>
        </div>
      </div>
    </ion-content>
  </ion-modal>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { IonModal, IonContent, IonIcon, IonSpinner } from '@ionic/vue';
import EmptyState from '@/components/EmptyState.vue';
import TransactionItem from '@/components/TransactionItem.vue';
import {
  closeOutline,
} from 'ionicons/icons';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true,
  },
  transactions: {
    type: Array,
    required: true,
    default: () => [],
  },
});

const emit = defineEmits(['update:isOpen']);

const LIMIT = 50;
const loadedCount = ref(LIMIT);
const isLoadingMore = ref(false);

const visibleTransactions = computed(() => {
  return props.transactions.slice(0, loadedCount.value);
});

const handleScroll = async (event) => {
  const scrollElement = event.target;
  const scrollTop = scrollElement.scrollTop;
  const scrollHeight = scrollElement.scrollHeight;
  const height = scrollElement.clientHeight;

  if (scrollHeight - (scrollTop + height) < 200) {
    if (loadedCount.value < props.transactions.length && !isLoadingMore.value) {
      isLoadingMore.value = true;
      await new Promise(resolve => setTimeout(resolve, 300));
      loadedCount.value = Math.min(loadedCount.value + LIMIT, props.transactions.length);
      isLoadingMore.value = false;
    }
  }
};

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    loadedCount.value = LIMIT;
  }
});

const closeModal = () => {
  emit('update:isOpen', false);
};
</script>

<style lang="scss">
@import '../theme/TransactionsModal.scss';
</style>
