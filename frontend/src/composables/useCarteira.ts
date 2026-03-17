import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, type Ref } from 'vue';
import { useRouter } from 'vue-router';
import { toastController } from '@ionic/vue';
import { storeToRefs } from 'pinia';
import { usePortfolioStore } from '@/stores';
import { api, CACHE_KEYS, cacheService } from '@/api';
import type { Asset, Strategy } from '@/types';
import { logger } from '@/utils/logger';
import type { Chart } from 'chart.js';

// Types
export type { Asset, Strategy };

export interface CarteiraState {
  isLoading: boolean;
  carrosselPausado: boolean;
  touchStartX: number;
  touchEndX: number;
}

/**
 * Composable for managing portfolio (carteira) data, charts, and interactions.
 * Provides state management for portfolio items, chart rendering, and asset sales.
 *
 * @param externalChartRef - Optional external reference to the canvas element
 * @param externalLegendCarousel - Optional external reference to the legend carousel element
 *
 * @example
 * const {
 *   carteira,
 *   totalPortfolioValue,
 *   formatCurrency,
 *   loadPortfolio
 * } = useCarteira()
 */
export function useCarteira(
  externalChartRef?: Ref<HTMLCanvasElement | null>,
  externalLegendCarousel?: Ref<HTMLElement | null>
) {
  const router = useRouter();
  const portfolioStore = usePortfolioStore();
  const {
    estrategias: storeEstrategias,
    isLoading: storeLoading,
    lastUpdate,
  } = storeToRefs(portfolioStore);

  // Local UI state
  const isProcessing = ref(false); // Prevents multiple clicks during buy/sell
  const carrosselPausado = ref(false);
  const touchStartX = ref(0);
  const touchEndX = ref(0);

  // Use store state for carteira
  const carteira = computed({
    get: () => storeEstrategias.value,
    set: value => {
      // For backward compatibility, sync with store if needed
      portfolioStore.$patch({ estrategias: value });
    },
  });

  const isLoading = computed(() => storeLoading.value);

  const chartRef = externalChartRef || ref<HTMLCanvasElement | null>(null);
  const chartInstance = ref<Chart | null>(null);
  const legendCarousel = externalLegendCarousel || ref<HTMLElement | null>(null);
  const legendasDuplicadas = ref<Array<{ nome: string; cor: string }>>([]);

  let carrosselInterval: NodeJS.Timeout | null = null;
  let pollingInterval: NodeJS.Timeout | null = null;

  // Constants
  const coresGrafico = [
    '#FF6384',
    '#36A2EB',
    '#FFCE56',
    '#4BC0C0',
    '#9966FF',
    '#FF9F40',
    '#C9CB3F',
    '#FF6F61',
    '#6B7280',
    '#34D399',
    '#F472B6',
    '#10B981',
    '#60A5FA',
    '#FBBF24',
    '#EC4899',
    '#4ADE80',
    '#F87171',
    '#38BDF8',
    '#A78BFA',
    '#FCD34D',
  ];

  // Computed properties
  /**
   * Calculates the total portfolio value by summing all strategy investments.
   * @returns Total value as a number
   */
  const totalPortfolioValue = computed(() => {
    return carteira.value.reduce((total, estrategia) => {
      return total + (parseFloat(estrategia.total_investido?.toString()) || 0);
    }, 0);
  });

  // Format functions
  /**
   * Formats a number as Brazilian Real currency.
   * @param valor - The numeric value to format
   * @returns Formatted string (e.g., "R$ 1.234,56")
   */
  const formatCurrency = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  /**
   * Calculates the profit percentage for an asset.
   * @param ativo - The asset with valor_medio and preco_atual
   * @returns Profit percentage as string with 2 decimal places
   */
  const calculateProfit = (ativo: Asset) => {
    if (!ativo?.valor_medio || !ativo?.preco_atual) return '0.00';
    const lucro = ((ativo.preco_atual - ativo.valor_medio) / ativo.valor_medio) * 100;
    return lucro.toFixed(2);
  };

  // Toast helper
  /**
   * Displays a toast message using Ionic's toast controller.
   * @param mensagem - The message to display
   * @param cor - Color theme ('primary' | 'success' | 'danger' | 'warning')
   * @param loading - If true, shows a persistent loading toast without auto-dismiss
   * @returns The toast element (useful for dismissal)
   */
  const showToast = async (
    mensagem: string,
    cor: 'primary' | 'success' | 'danger' | 'warning',
    loading = false
  ) => {
    if (loading) {
      return await toastController.create({
        message: mensagem,
        duration: 0, // No auto-dismiss for loading
        color: cor,
        position: 'top',
      });
    }

    const toast = await toastController.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top',
    });
    await toast.present();
  };

  // Actions
  const toggleDetalhes = (id: string) => {
    // Use store toggle
    portfolioStore.toggleEstrategia(id);
  };

  const venderAsset = async (ativo: Asset, estrategiaId: string) => {
    if (isProcessing.value) {
      await showToast('Aguarde, processando operação anterior...', 'warning');
      return;
    }

    isProcessing.value = true;

    try {
      if (!ativo.quantidadeVenda || ativo.quantidadeVenda <= 0) {
        await showToast('Informe uma quantidade válida para venda', 'warning');
        return;
      }

      if (ativo.quantidadeVenda > ativo.quantidade) {
        await showToast('Quantidade solicitada maior que a disponível', 'warning');
        return;
      }

      const loadingMessage = await showToast('Processando venda...', 'primary', true);

      const precoVenda = ativo.precoVenda || ativo.preco_atual || ativo.valor_medio;

      if (!precoVenda || precoVenda <= 0) {
        await showToast('Informe um preço de venda válido', 'warning');
        return;
      }

      const vendaData = {
        codigo_ativo: ativo.codigo,
        estrategia_id: estrategiaId,
        quantidade: parseFloat(ativo.quantidadeVenda.toString()),
        preco_venda: parseFloat(precoVenda.toString()),
      };

      const vendaResponse = await (api as any).post('/vender', vendaData);

      cacheService.invalidate(/carteira/);
      cacheService.invalidate(/usuarios/);
      cacheService.invalidate(/transacoes/);

      const { data: carteiraAtualizada } = await api.cachedGet('/carteira', CACHE_KEYS.CARTEIRA, {
        force: true,
      });

      const estrategiasAbertas = new Set(carteira.value.filter(e => e.aberto).map(e => e.id));

      carteira.value = carteiraAtualizada.map((estrategia: any) => {
        return {
          ...estrategia,
          aberto: estrategiasAbertas.has(estrategia.id),
          ativos: (estrategia.ativos || []).map((ativoItem: any) => ({
            ...ativoItem,
            quantidadeVenda: 0,
            precoVenda: ativoItem.valor_medio || ativoItem.preco_atual || 0,
            codigo: ativoItem.codigo || ativoItem.codigo_ativo,
          })),
        };
      });

      if (loadingMessage) {
        await loadingMessage.dismiss();
      }
      await showToast('Venda realizada com sucesso!', 'success');

      window.dispatchEvent(new CustomEvent('transacao-atualizada'));
    } catch (error: any) {
      logger.error('Error during sale:', error);

      let errorMessage = 'Erro ao processar venda';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 404) {
        errorMessage = 'Endpoint de venda não encontrado';
      } else if (error.response?.status === 500) {
        errorMessage = 'Erro interno do servidor';
      } else if (error.message) {
        errorMessage = error.message;
      }

      await showToast(errorMessage, 'danger');
    } finally {
      isProcessing.value = false;
    }
  };

  const irParaInvestir = () => {
    router.push('/tabs/estrategias');
  };

  // Chart functions
  const atualizarGrafico = async () => {
    await nextTick();
    await new Promise(resolve => setTimeout(resolve, 200));

    if (!chartRef.value) {
      return;
    }

    // Se carteira estiver vazia, destruir gráfico existente
    if (!carteira.value.length) {
      if (chartInstance.value) {
        chartInstance.value.destroy();
        chartInstance.value = null;
      }
      return;
    }

    // Destroy previous chart and get fresh canvas
    if (chartInstance.value) {
      chartInstance.value.destroy();
      chartInstance.value = null;
    }

    // Wait for canvas to be fully released
    await new Promise(resolve => setTimeout(resolve, 100));

    // Check if canvas is still attached and valid
    if (!chartRef.value || !chartRef.value.parentElement) {
      return;
    }

    // Create a new canvas context to ensure clean state
    const canvas = chartRef.value;
    canvas.width = canvas.width; // This resets the canvas state

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return;
    }

    const data = carteira.value.map(estrategia => estrategia.total_investido);
    const labels = carteira.value.map(estrategia => estrategia.nome);
    const colors = carteira.value.map((_, index) => coresGrafico[index % coresGrafico.length]);

    // Dynamic import of Chart.js for tree shaking
    const { Chart, DoughnutController, ArcElement, Tooltip, Legend } = await import('chart.js');

    Chart.register(DoughnutController, ArcElement, Tooltip, Legend);

    // Check if this canvas already has a chart attached
    const existingChart = Chart.getChart(chartRef.value);
    if (existingChart) {
      existingChart.destroy();
    }

    try {
      chartInstance.value = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data,
            backgroundColor: colors,
            borderWidth: 0,
            borderRadius: 12,
            hoverOffset: 8,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '70%',
        spacing: 2,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            callbacks: {
              label: context => {
                const value = context.parsed;
                const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                const percentage = ((value / total) * 100).toFixed(1);
                return `${context.label}: ${formatCurrency(value)} (${percentage}%)`;
              },
            },
          },
        },
        elements: {
          arc: {
            borderWidth: 0,
            borderRadius: 8,
            hoverOffset: 4,
            hoverBorderWidth: 0,
          },
        },
        animation: {
          animateScale: true,
          animateRotate: true,
          duration: 800,
          easing: 'easeOutQuart',
        },
        onClick: (event, elements) => {
          if (!chartRef.value) return;

          const chartContainer = chartRef.value.parentElement;
          if (!chartContainer) return;

          const centerText = chartContainer.querySelector('.chart-center-text');

          if (elements.length > 0) {
            const index = elements[0].index;
            const estrategia = carteira.value[index];
            if (estrategia && centerText) {
              centerText.textContent = `${estrategia.porcentagem}%`;
            }
          } else if (centerText) {
            centerText.textContent = '100%';
          }
        },
      },
    });

    } catch (error) {
      logger.error('Erro ao criar gráfico', error);
      return;
    }

    // Update legendas duplicadas
    legendasDuplicadas.value = carteira.value.map((item, index) => ({
      nome: item.nome,
      cor: coresGrafico[index % coresGrafico.length],
    }));

    // Adicionar texto central com 100%
    if (!chartRef.value) return;

    const chartContainer = chartRef.value.parentElement;
    if (!chartContainer) return;

    const existingCenterText = chartContainer.querySelector('.chart-center-text');
    if (existingCenterText) {
      existingCenterText.remove();
    }

    const centerText = document.createElement('div');
    centerText.className = 'chart-center-text';
    centerText.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: 700;
      color: #F9FAFB;
      text-align: center;
      pointer-events: none;
      z-index: 3;
      opacity: 0.9;
    `;
    centerText.textContent = '100%';
    chartContainer.appendChild(centerText);
  };

  // Carousel functions
  const iniciarCarrossel = () => {
    if (carrosselInterval) return;

    carrosselInterval = setInterval(() => {
      if (!carrosselPausado.value && legendCarousel.value) {
        const scrollLeft = legendCarousel.value.scrollLeft;
        const scrollWidth = legendCarousel.value.scrollWidth;
        const clientWidth = legendCarousel.value.clientWidth;

        if (scrollLeft + clientWidth >= scrollWidth - 1) {
          legendCarousel.value.scrollLeft = 0;
        } else {
          legendCarousel.value.scrollLeft += 1;
        }
      }
    }, 30);
  };

  const pararCarrossel = () => {
    carrosselPausado.value = true;
  };

  const retomarCarrossel = () => {
    carrosselPausado.value = false;
  };

  const toqueInicio = (event: TouchEvent) => {
    touchStartX.value = event.touches[0].clientX;
    pararCarrossel();
  };

  const toqueFim = (event: TouchEvent) => {
    touchEndX.value = event.changedTouches[0].clientX;
    const diff = touchStartX.value - touchEndX.value;

    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left
        if (legendCarousel.value) {
          legendCarousel.value.scrollLeft += 100;
        }
      } else {
        // Swipe right
        if (legendCarousel.value) {
          legendCarousel.value.scrollLeft -= 100;
        }
      }
    }

    setTimeout(retomarCarrossel, 2000);
  };

  // Data loading - uses store
  const loadPortfolio = async () => {
    try {
      // Use store to fetch portfolio
      await portfolioStore.fetchPortfolio();

      // Sync with local state for backward compatibility
      // The store already transforms the data, but we need to ensure compatibility
      if (storeEstrategias.value.length > 0) {
        await nextTick();
        await atualizarGrafico();
        iniciarCarrossel();
      }
    } catch (error) {
      logger.error('Error loading portfolio:', error);
      showToast('Erro ao carregar carteira', 'danger');
    }
  };

  // Polling for real-time updates - DESATIVADO
  const iniciarPolling = () => {};

  const pararPolling = () => {
    if (pollingInterval) {
      clearInterval(pollingInterval);
      pollingInterval = null;
    }
  };

  // Initialize
  const initialize = async () => {
    await loadPortfolio();

    if (carteira.value.length > 0) {
      await nextTick();
      await atualizarGrafico();
      iniciarCarrossel();
    }
  };

  // Cleanup
  const cleanup = () => {
    if (chartInstance.value) {
      chartInstance.value.destroy();
    }
    if (carrosselInterval) {
      clearInterval(carrosselInterval);
    }
    pararPolling();
  };

  // Watch for window resize
  const handleResize = () => {
    if (chartInstance.value) {
      chartInstance.value.resize();
    }
  };

  // Component lifecycle
  onMounted(() => {
    initialize();
    window.addEventListener('resize', handleResize);
  });

  onBeforeUnmount(() => {
    cleanup();
    window.removeEventListener('resize', handleResize);
  });

  return {
    // State
    isLoading,
    isProcessing,
    carrosselPausado,
    touchStartX,
    touchEndX,
    carteira,
    chartRef,
    chartInstance,
    legendCarousel,
    legendasDuplicadas,
    coresGrafico,

    // Computed
    totalPortfolioValue,

    // Methods
    formatCurrency,
    calculateProfit,
    showToast,
    toggleDetalhes,
    venderAtivo: venderAsset,
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
  };
}
