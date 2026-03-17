export interface User {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  saldo: number;
}

export interface Transaction {
  id: string;
  tipo: 'compra' | 'venda';
  descricao: string;
  valor: number;
  data: string;
  updatedAt?: string;
}

export interface Asset {
  codigo: string;
  codigo_ativo: string;
  quantidade: number;
  valor_medio: number;
  preco_atual: number;
  quantidadeVenda?: number;
  precoVenda?: number;
}

export interface Strategy {
  id: string;
  nome: string;
  descricao?: string;
  tipo_estrategia: string;
  rentabilidade_media: number | null;
  total_ativos: number;
  total_investido: number;
  porcentagem: number;
  aberto: boolean;
  ativos: Asset[];
  created_at?: string;
}

export interface Portfolio {
  estrategias: Strategy[];
  totalValue: number;
  lastUpdate: Date | null;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface UpdateProfilePayload {
  nome: string;
  novaSenha?: string;
}

export interface SellAssetPayload {
  codigo_ativo: string;
  estrategia_id: string;
  quantidade: number;
  preco_venda: number;
}
