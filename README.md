# GrowGuru - Aplicativo de Gestão de Investimentos

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Vue.js](https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white)
![Ionic](https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)

</div>

---

## 📋 Visão Geral do Projeto

O **GrowGuru** é uma aplicação móvel híbrida completa para gestão de investimentos pessoais, desenvolvida com tecnologias modernas e escaláveis. O aplicativo permite que usuários acompanhem suas estratégias de investimento, realizem transações (compra e venda de ativos), visualizem seu portfólio e monitorem a rentabilidade de suas aplicações financeiras.

A aplicação foi projetada com foco na experiência do usuário, utilizando design moderno com elementos de **glassmorphism**, animações suaves e uma interface responsiva que funciona tanto em dispositivos móveis quanto em navegadores desktop.

---

## 🏗️ Arquitetura do Projeto

O projeto segue uma arquitetura **monorepo** com separação clara entre frontend e backend:

```
growguru/
├── backend/                 # API RESTful em Node.js
│   ├── config/            # Configurações (banco de dados, CORS)
│   ├── controllers/       # Lógica de negócio
│   ├── middleware/       # Middlewares (autenticação, cache, segurança)
│   ├── models/           # Modelos de dados (Supabase)
│   ├── routes/          # Definição das rotas da API
│   ├── utils/           # Utilitários
│   └── tests/           # Testes automatizados (Jest)
│
├── frontend/              # Aplicação Ionic + Vue.js
│   ├── src/
│   │   ├── api/         # Configurações de API
│   │   ├── assets/      # Recursos estáticos (imagens, fonts)
│   │   ├── components/  # Componentes Vue reutilizáveis
│   │   ├── composables/ # Composables do Vue (lógica reutilizável)
│   │   ├── constants/   # Constantes da aplicação
│   │   ├── router/      # Configuração de rotas (Vue Router)
│   │   ├── stores/      # Estado global (Pinia)
│   │   ├── theme/       # Estilização (CSS variables, SCSS)
│   │   ├── types/       # Definições de tipos TypeScript
│   │   ├── views/       # Páginas da aplicação
│   │   └── utils/       # Utilitários
│   ├── android/         # Configurações nativas Android (Capacitor)
│   └── tests/          # Testes (Cypress, Vitest)
│
├── theme/                # Arquivos de tema globais
├── diagramas/           # Diagramas de arquitetura
└── planos/              # Documentação de planejamento
```

---

## 🛠️ Tecnologias Utilizadas

### Backend

| Tecnologia | Descrição |
|------------|-----------|
| **Node.js** | Runtime JavaScript server-side |
| **Express** | Framework web para APIs REST |
| **Supabase** | Backend-as-a-Service (PostgreSQL + Auth) |
| **Joi** | Validação de dados |
| **Winston** | Sistema de logs |
| **Helmet** | Segurança de headers HTTP |
| **Socket.IO** | Comunicação em tempo real |
| **Jest** | Framework de testes unitários |
| **Supertest** | Testes de API HTTP |

### Frontend

| Tecnologia | Descrição |
|------------|-----------|
| **Vue.js 3** | Framework progressivo JavaScript |
| **TypeScript** | Superset tipado de JavaScript |
| **Ionic Framework** | Framework UI mobile-first |
| **Vue Router** | Roteamento SPA |
| **Pinia** | Gerenciamento de estado |
| **Axios** | Cliente HTTP |
| **Chart.js** | Visualização de dados e gráficos |
| **TailwindCSS** | Framework CSS utilitário |
| **Capacitor** | Runtime nativo para apps híbridos |
| **Socket.IO Client** | Cliente WebSocket |
| **Cypress** | Testes E2E |
| **Vitest** | Testes unitários |

---

## 📱 Funcionalidades Principais

### 1. Autenticação e Gestão de Usuários

- **Login**: Autenticação segura com email e senha
- **Cadastro**: Criação de novas contas de usuário
- **Recuperação de Senha**: Sistema de reset de senha via email
- **Gerenciamento de Perfil**: Atualização de dados pessoais

### 2. Gestão de Portfólio

- **Visualização de Carteira**: Exibição completa dos ativos por estratégia
- **Gráficos Interativos**: Visualização da distribuição do portfólio
- **Cálculo de Rentabilidade**: Métricas de desempenho dos investimentos
- **Detalhamento por Estratégia**: Organização de ativos por categoria

### 3. Transações

- **Registro de Compras**: Compra de ativos com quantidade e valor
- **Registro de Vendas**: Venda de ativos existentes
- **Histórico de Transações**: Lista paginada de todas as operações
- **Filtragem**: Filtragem por tipo (compra/venda)

### 4. Estratégias de Investimento

- **Lista de Estratégias**: Visualização de todas as estratégias cadastradas
- **Ativos por Estratégia**: Detalhamento dos ativos que compõem cada estratégia
- **Métricas**: Rentabilidade média, total investido, quantidade de ativos
- **Abertura/Fechamento**: Controle do status de cada estratégia

### 5. Interface e Experiência do Usuário

- **Design Moderno**: Elementos de glassmorphism e visual contemporâneo
- **Animações Suaves**: Transições fluidas entre telas
- **Feedback Visual**: Loading spinners, estados vazios, mensagens de erro
- **Responsividade**: Funcionamento em diferentes tamanhos de tela
- **Refresh Pull-to-Refresh**: Atualização de dados por gesto

---

## 🔌 API Endpoints

### Autenticação

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/login` | Realiza login |
| POST | `/api/signup` | Cria nova conta |
| POST | `/api/forgot-password` | Solicita recuperação de senha |
| POST | `/api/reset-password` | Redefine a senha |

### Usuários

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/usuarios` | Lista usuários |
| GET | `/api/usuarios/me` | Obtém dados do usuário atual |
| PUT | `/api/usuarios` | Atualiza dados do usuário |

### Transações

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/transacoes` | Lista transações (paginado) |
| POST | `/api/transacoes` | Cria nova transação |

### Carteira

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/carteira` | Obtém portfólio completo |
| POST | `/api/carteira/comprar` | Registra compra de ativo |
| POST | `/api/carteira/vender` | Registra venda de ativo |
| GET | `/api/carteira/total` | Obtém total investido |

### Estratégias

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/api/estrategias` | Lista todas as estratégias |
| GET | `/api/estrategias/:id/ativos` | Lista ativos de uma estratégia |

---

## 📁 Estrutura de Dados

### Modelo de Usuário

```typescript
interface User {
  id: string;
  nome: string;
  email: string;
  created_at: string;
  saldo: number;
}
```

### Modelo de Transação

```typescript
interface Transaction {
  id: string;
  tipo: 'compra' | 'venda';
  descricao: string;
  valor: number;
  data: string;
  updatedAt?: string;
}
```

### Modelo de Ativo

```typescript
interface Asset {
  codigo: string;
  codigo_ativo: string;
  quantidade: number;
  valor_medio: number;
  preco_atual: number;
  quantidadeVenda?: number;
  precoVenda?: number;
}
```

### Modelo de Estratégia

```typescript
interface Strategy {
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
```

---

## 🧪 Testes

### Backend

O projeto backend utiliza **Jest** para testes unitários e de integração:

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm run test:watch

# Executar testes com cobertura
npm run test:coverage
```

**Arquivos de teste:**
- `tests/auth.test.js` - Testes de autenticação
- `tests/transaction.test.js` - Testes de transações
- `tests/portfolio.test.js` - Testes de portfólio
- `tests/strategy.test.js` - Testes de estratégias

### Frontend

O projeto frontend utiliza **Cypress** para testes E2E e **Vitest** para testes unitários:

```bash
# Executar testes E2E
npm run test:e2e

# Executar testes unitários
npm run test:unit
```

---

## 🔒 Segurança

O projeto implementa diversas camadas de segurança:

### Backend

- **Helmet.js**: Configuração de headers HTTP seguros
- **Rate Limiting**: Limitação de requisições para prevenir ataques
- **CORS**: Configuração de Cross-Origin Resource Sharing
- **Validação de Dados**: Joi para validação de entrada
- **Logging**: Winston para registro de eventos e erros
- **Error Handling**: Middleware centralizado de tratamento de erros
- **Cache**: Sistema de cache para otimização de performance

### Frontend

- **Autenticação por Token**: JWT armazenado localmente
- **Rotas Protegidas**: Middleware de autenticação no router
- **Sanitização**: Limpeza de dados de entrada
- **Headers CSP**: Content Security Policy configurada

---

## 🚀 Middlewares do Backend

| Middleware | Descrição |
|------------|-----------|
| `auth.js` | Autenticação e autorização JWT |
| `cache.js` | Sistema de cache em memória |
| `errorHandler.js` | Tratamento centralizado de erros |
| `logger.js` | Sistema de logs com Winston |
| `metrics.js` | Coleta de métricas de requisição |
| `security.js` | Rate limiting e headers de segurança |
| `validation.js` | Validação de dados com Joi |

---

## 📦 Gerenciamento de Estado (Frontend)

O projeto utiliza **Pinia** para gerenciamento de estado global:

| Store | Descrição |
|-------|-----------|
| `auth.ts` | Gerenciamento de autenticação e usuário |
| `transactions.ts` | Estado das transações |
| `portfolio.ts` | Estado do portfólio/carteira |

### Composables Reutilizáveis

| Composable | Descrição |
|------------|-----------|
| `useAuth.ts` | Lógica de autenticação |
| `useCarteira.ts` | Lógica da carteira |
| `useEstrategias.ts` | Lógica de estratégias |
| `useAtivosEstrategia.ts` | Lógica de ativos por estratégia |
| `useRentabilidade.ts` | Cálculo de rentabilidade |
| `useProfile.ts` | Gerenciamento de perfil |
| `useHomePage.ts` | Lógica da página inicial |
| `useForgotPassword.ts` | Recuperação de senha |
| `useSignUp.ts` | Cadastro de usuário |

---

## 🎨 Design e UI/UX

### Estilização

O projeto utiliza uma combinação de:

- **TailwindCSS**: Classes utilitárias para layout responsivo
- **SCSS**: Estilização customizada com variáveis
- **CSS Variables**: Definição de cores e temas
- **Ionic CSS Utilities**: Componentes e utilitários do Ionic

### Temas

O projeto suporta temas claro e escuro, com variáveis customizadas em:
- `theme/variables.css`
- `theme/*.scss` (arquivos de estilo por funcionalidade)

### Componentes Reutilizáveis

| Componente | Descrição |
|------------|-----------|
| `TabsLayout.vue` | Layout com navegação por abas |
| `LoadingSpinner.vue` | Indicador de carregamento |
| `EmptyState.vue` | Estado quando não há dados |
| `TransactionItem.vue` | Item de transação na lista |
| `ErrorBoundary.vue` | Tratamento de erros React-like |
| `ChartCenterText.vue` | Gráfico com texto central |
| `GlobalLoading.vue` | Loading global da aplicação |

---

## 📲 Build e Deploy

### Backend

O backend pode ser implantado em diferentes plataformas:

- **Vercel**: Configuração em `vercel.json`
- **Railway**: Configuração em `railway.toml`
- **Servidor Local**: Node.js com `npm start`

### Frontend

O frontend suporta múltiplas plataformas:

- **Web**: Build com Vite (`npm run build`)
- **Android**: Build nativo com Capacitor
- **PWA**: Progressive Web App (configurável)

---

## 📊 Monitoramento e Performance

### Cache

O sistema implementa cache em múltiplas camadas:

- **Backend**: Node-Cache para responses API
- **Frontend**: Sistema de cache com过期 (TTL configurable)
- **API**: Headers de cache-control

### Logs

O backend utiliza Winston para logs estruturados:

- Logs de acesso
- Logs de erro
- Logs de performance (profiler)

### Métricas

Middleware de métricas para monitoramento:

- Tempo de resposta
- Status codes
- Origem das requisições

---

## 🔧 Configurações de Ambiente

### Variáveis de Ambiente (Backend)

```env
PORT=3000
NODE_ENV=development
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

### Configurações CORS

O CORS está configurado para permitir origens específicas em desenvolvimento e produção.

---

## 📈 Fluxo de Dados

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│    API      │────▶│  Supabase   │
│   (Vue.js)  │◀────│  (Express)  │◀────│ (PostgreSQL)│
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │
       │                   │
   Pinia Store        Winston Logs
   (Estado)          (Monitoramento)
```

---

## 🗺️ Roadmap e Melhorias Futuras

O projeto possui documentação de melhorias em:
- `planos/melhorias.md`
- `planos/melhorias-backend.md`
- `backend/REFACTORING_PLAN.md`

---

## 📄 Licença

Este projeto está sob desenvolvimento para fins educacionais e comerciais.

---

## 👨‍💻 Autor

Desenvolvido como projeto de aprendizado e portfólio.

---

## 🔗 Links Relacionados

- [Documentação Ionic](https://ionicframework.com/docs)
- [Documentação Vue.js](https://vuejs.org/guide/)
- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Express](https://expressjs.com/pt-br/)
