import { computed, type Ref } from 'vue';

export function useRentabilidade(investido: Ref<number>, saldo: Ref<number>) {
  const rentabilidadePercentual = computed(() => {
    if (investido.value === 0 && saldo.value < 0) {
      return `-${Math.abs(saldo.value).toFixed(2)}`;
    }
    if (investido.value === 0) {
      return '0.00';
    }
    const percentual = ((saldo.value + investido.value) / investido.value) * 100;
    return `${percentual >= 0 ? '+' : ''}${percentual.toFixed(2)}`;
  });

  const rentabilidadeClasse = computed(() => {
    if (investido.value === 0 && saldo.value < 0) {
      return 'loss';
    }
    if (investido.value === 0) {
      return 'neutral';
    }
    const valor = saldo.value + investido.value;
    return valor >= 0 ? 'profit' : 'loss';
  });

  return { rentabilidadePercentual, rentabilidadeClasse };
}
