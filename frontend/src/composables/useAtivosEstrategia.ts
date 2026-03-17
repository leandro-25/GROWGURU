import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { api, CACHE_KEYS, cacheService } from '@/api';
import { toastController } from '@ionic/vue';
import type { Strategy } from '@/types';
import { logger } from '@/utils/logger';

// Types
export type { Strategy };

export interface Ativo {
  id: string;
  codigo_ativo: string;
  posicao: number;
  valorCompra: number;
  quantidade: number;
  ativos: {
    codigo: string;
    nome: string;
    tipo: string;
    preco_atual: number;
  };
}

export interface AtivosEstrategiaState {
  loading: boolean;
  showActions: boolean;
  showNewsCard: boolean;
  selectedAtivo: Ativo | null;
  loadingNews: boolean;
  newsContent: string;
  newsImpact: 'positivo' | 'negativo' | 'neutro';
}

export function useAtivosEstrategia() {
  const router = useRouter();
  const route = useRoute();

  // State
  const loading = ref(true);
  const isProcessing = ref(false); // Prevents multiple clicks during buy
  const showActions = ref(false);
  const showNewsCard = ref(false);
  const selectedAtivo = ref<Ativo | null>(null);
  const loadingNews = ref(false);
  const newsContent = ref('');
  const newsImpact = ref<'positivo' | 'negativo' | 'neutro'>('neutro');

  const estrategiaNome = ref('');
  const ativos = ref<Ativo[]>([]);

  // Computed properties
  const estrategiaId = computed(() => route.params.id as string);

  // Format functions
  const formatCurrency = (value: number) => {
    return parseFloat(value.toString()).toFixed(2).replace('.', ',');
  };

  const formatPercentage = (value: number) => {
    return `${value > 0 ? '+' : ''}${parseFloat(value.toString()).toFixed(2)}%`;
  };

  const formatAssetType = (type: string) => {
    const types: Record<string, string> = {
      acao: 'Ação',
      fii: 'Fundo Imobiliário',
      bdr: 'BDR',
      etf: 'ETF',
      stock: 'Ação',
      reit: 'FII',
      crypto: 'Criptomoeda',
    };
    return types[type.toLowerCase()] || type;
  };

  const calculateTotal = (ativo: Ativo) => {
    const total = ativo.valorCompra * ativo.quantidade;
    return isNaN(total) ? '0,00' : formatCurrency(total);
  };

  // Toast helper
  const showToast = async (
    message: string,
    color: 'primary' | 'success' | 'danger' | 'warning'
  ) => {
    const toast = await toastController.create({
      message: message,
      duration: 3000,
      color: color,
      position: 'top',
    });
    await toast.present();
  };

  // Actions
  const toggleActions = () => {
    showActions.value = !showActions.value;
  };

  const toggleNewsCard = async (ativo: Ativo) => {
    try {
      loadingNews.value = true;
      selectedAtivo.value = ativo;
      showNewsCard.value = true;

      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/noticias`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          body: JSON.stringify({
            ticker: ativo.ativos.codigo,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Erro ao buscar notícias');
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      newsContent.value = data.resumo || 'Nenhuma notícia encontrada para este ativo.';
      newsImpact.value = (data.impacto || 'neutro').toLowerCase() as
        | 'positivo'
        | 'negativo'
        | 'neutro';
    } catch (error) {
      logger.error('Error fetching news:', error);
      newsContent.value = 'Não foi possível carregar as notícias no momento.';
      newsImpact.value = 'neutro';
      showNewsCard.value = true;
    } finally {
      loadingNews.value = false;
    }
  };

  const handleRefreshAction = async (event?: any) => {
    cacheService.invalidate(/estrategias/);
    await loadData();
    showActions.value = false;
    if (event?.target) {
      event.target.complete();
    }
  };

  const goBack = () => {
    router.go(-1);
  };

  const onValorChange = (event: any, ativo: Ativo) => {
    const novoValor = parseFloat(event.detail.value);
    ativo.valorCompra = isNaN(novoValor) ? ativo.ativos.preco_atual : novoValor;
  };

  const onQuantidadeChange = (event: any, ativo: Ativo) => {
    const novaQtd = parseInt(event.detail.value, 10);
    ativo.quantidade = isNaN(novaQtd) ? 1 : novaQtd;
  };

  const adicionarCarteira = async (ativo: Ativo) => {
    if (isProcessing.value) {
      showToast('Aguarde, processando operação anterior...', 'warning');
      return;
    }

    isProcessing.value = true;

    try {
      const estrategiaIdNum = parseInt(estrategiaId.value);

      if (isNaN(estrategiaIdNum)) {
        throw new Error('ID da estratégia inválido');
      }

      const valor = ativo.valorCompra;
      const qtd = ativo.quantidade;

      if (isNaN(valor) || valor <= 0) throw new Error('Valor inválido');
      if (isNaN(qtd) || qtd <= 0) throw new Error('Quantidade inválida');

      const response = await (api as any).post('/carteira', {
        codigo_ativo: ativo.ativos.codigo,
        quantidade: qtd,
        valor_compra: valor,
        estrategia_id: estrategiaIdNum,
      });

      cacheService.invalidate(/carteira/);
      cacheService.invalidate(/usuarios/);
      cacheService.invalidate(/transacoes/);
      cacheService.invalidate(/estrategias/);

      if (response.data?.data?.novo_saldo !== undefined) {
        window.dispatchEvent(
          new CustomEvent('saldo-atualizado', {
            detail: { novo_saldo: response.data.data.novo_saldo },
          })
        );
      }

      window.dispatchEvent(new CustomEvent('carteira-atualizada'));
      window.dispatchEvent(new CustomEvent('transacao-atualizada'));

      showToast(`${qtd} unidade(s) compradas!`, 'success');
      ativo.valorCompra = ativo.ativos.preco_atual;
      ativo.quantidade = 1;
    } catch (error: any) {
      logger.error('Error during purchase:', error);
      showToast(error.response?.data?.error || error.message, 'danger');
    } finally {
      isProcessing.value = false;
    }
  };

  const loadData = async () => {
    loading.value = true;
    try {
      // Buscar todas as estratégias primeiro
      const estrategiasResponse = await api.cachedGet('/estrategias', CACHE_KEYS.ESTRATEGIAS);

      // Encontrar a estratégia com o ID correspondente
      const estrategiaSelecionada = estrategiasResponse.data.find(
        (e: Strategy) => e.id == estrategiaId.value
      );

      if (!estrategiaSelecionada) {
        showToast('Estratégia não encontrada', 'warning');
        router.push('/tabs/estrategias');
        return;
      }

      // Buscar os ativos da estratégia
      const ativosResponse = await api.cachedGet(
        `/estrategias/${estrategiaId.value}/ativos`,
        CACHE_KEYS.PORTFOLIO_DETAILS
      );

      // Atualizar o nome da estratégia no cabeçalho
      estrategiaNome.value = estrategiaSelecionada.nome || 'Estratégia';

      // Inicializar com valores editáveis
      ativos.value = ativosResponse.data.map((a: any) => {
        const precoAtual = a.ativo?.preco_atual || 0;
        return {
          ...a,
          valorCompra: precoAtual,
          quantidade: 1,
          ativos: {
            preco_atual: precoAtual,
            codigo: a.codigo_ativo,
            nome: a.ativo?.nome || '',
            tipo: a.ativo?.tipo || '',
          },
        };
      });
    } catch (error) {
      logger.error('Error:', error);
      showToast('Falha ao carregar dados', 'danger');
    } finally {
      loading.value = false;
    }
  };

  // Initialize
  const initialize = () => {
    loadData();
  };

  // Watch route changes
  watch(
    () => route.params.id,
    (newId, oldId) => {
      if (newId && newId !== oldId) {
        loadData();
      }
    }
  );

  return {
    // State
    loading,
    isProcessing,
    showActions,
    showNewsCard,
    selectedAtivo,
    loadingNews,
    newsContent,
    newsImpact,
    estrategiaNome,
    ativos,

    // Computed
    estrategiaId,

    // Methods
    formatCurrency,
    formatPercentage,
    formatAssetType,
    calculateTotal,
    showToast,
    toggleActions,
    toggleNewsCard,
    handleRefreshAction,
    goBack,
    onValorChange,
    onQuantidadeChange,
    adicionarCarteira,
    loadData,
    initialize,
  };
}
