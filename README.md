# GrowGuru - Seu Guia de Investimentos

Aplicativo móvel híbrido para organizar e acompanhar investimentos de forma simples e eficiente. Permite visualizar a carteira completa, registrar compras e vendas, acompanhar a rentabilidade e organizar os ativos por estratégias.

## O que é o GrowGuru

- Visualização da **carteira completa**, separada por estratégia
- Registro de **compras e vendas** de ativos
- Acompanhamento da **rentabilidade** dos investimentos
- Organização dos ativos por **estratégias**

## Pipeline de Dados e Inteligência Artificial

O coração do projeto é um pipeline de **ETL (Extração, Transformação e Carga)** em Python, que consome dados reais da B3 via Yahoo Finance, trata as informações com Pandas/NumPy e carrega em um banco relacional PostgreSQL (Supabase).

### 1. Backtest de Estratégias (`estrategias/`)

Sistema de simulação histórica que testa estratégias de investimento com dados reais do mercado brasileiro:

- 412 ativos da B3 (ações, FIIs, BDRs)
- 5 anos de dados históricos (2020-2025)
- 14 estratégias testadas

#### Resultados do Backtest (5 anos)

| Estratégia | Retorno | Sharpe |
|------------|---------|--------|
| Estratégia Athena | **197.37%** | 1.26 |
| Estratégia Croesus | **192.24%** | 1.16 |
| Estratégia Aurum | **192.24%** | 1.16 |
| Estratégia Lakshmi | **137.25%** | 0.75 |
| Estratégia Plutus | **138.93%** | 0.75 |
| Benchmark IBOV | 50.01% | 0.22 |

#### Como funciona o backtest

1. Coleta de dados de preço, volume e indicadores fundamentalistas (P/L, ROE, dividend yield etc.)
2. Aplicação de análises, filtros e rankings para seleção de ativos
3. Simulação de carteira com rebalanceamento semanal/mensal
4. Cálculo de retorno total e índice de Sharpe
5. Salvamento dos resultados no banco de dados (Supabase)

### 2. Análise de Notícias com IA (`crerwai/`)

Agente de inteligência artificial que monitora e analisa notícias sobre os ativos da carteira:

- Integração com LLMs (Groq/LiteLLM)
- Análise de sentimento das notícias
- Determinação de impacto (positivo/neutro/negativo)
- API REST para consumo pelo aplicativo principal

#### Arquitetura

```
Frontend (Ionic/Vue)
       |
       v
Backend API (Node/Express)
       |
       v
Supabase (Dados + Auth)
       |
       +--> Backtest Engine (Python/Jupyter)
       |         |
       |         v
       |    Analise de Dados
       |    (Pandas, NumPy, TA-Lib)
       |
       +--> Agente de IA (Flask + LLM)
                 |
                 v
             Analise de Noticias
             (Groq API)
```

#### Tecnologias de IA/ML utilizadas

- **Python** — linguagem principal para análise
- **Pandas / NumPy** — manipulação de dados
- **TA-Lib** — indicadores técnicos (RSI, MACD, SMA)
- **yfinance** — coleta de dados do mercado
- **LiteLLM** — interface unificada para LLMs
- **Groq** — API de inferência de LLM
- **Flask** — API para análise de notícias
- **Jupyter Notebook** — backtest interativo

## Tecnologias

### Backend (API)
- **Node.js** + **Express** — API REST
- **PostgreSQL** (via Supabase) — modelagem e armazenamento do histórico de ativos
- **Winston** — logs e monitoramento
- **Jest** — testes automatizados

### Frontend (App)
- **Vue.js 3** com **TypeScript** — interface reativa e tipada
- **Ionic Framework** — interface mobile
- **Pinia** — gerenciamento de estado
- **Chart.js** — gráficos
- **TailwindCSS** — estilização

## Principais Funcionalidades

### Autenticação
- Login e cadastro seguro
- Recuperação de senha via e-mail
- Tokens JWT para segurança

### Página Inicial
- Saldo total investido
- Percentual de rentabilidade
- Transações recentes
- Acesso rápido ao perfil

### Carteira
- Visualização completa do portfólio
- Gráfico de distribuição por estratégia
- Detalhamento de cada ativo
- Porcentagem de cada posição

### Transações
- Registro de compras e vendas
- Histórico paginado
- Filtro por tipo

### Estratégias
- Lista de estratégias cadastradas
- Ativos que compõem cada estratégia
- Rentabilidade média
- Status (aberta/fechada)

## Organização do Projeto

```
growguru/
├── backend/              # API RESTful
│   ├── controllers/      # Logica do servidor
│   ├── routes/           # Rotas da API
│   ├── models/           # Acesso ao banco
│   ├── middleware/       # Seguranca e utilitarios
│   └── tests/            # Testes automatizados
├── frontend/             # Aplicativo Ionic
│   ├── src/
│   │   ├── views/        # Paginas do app
│   │   ├── components/   # Componentes reutilizaveis
│   │   ├── stores/       # Estado global (Pinia)
│   │   ├── composables/  # Logica reutilizavel
│   │   └── router/       # Navegacao
│   └── android/          # Config Android (Capacitor)
├── estrategias/          # Backtest de estrategias (Python/Jupyter)
│   └── tg.ipynb          # Notebook de analise de dados
└── crerwai/              # Agente de IA para noticias
    ├── app.py            # API Flask
    └── teste_otimizado.py # Modulo de analise LLM
```

## Design

- **Glassmorphism** — efeitos de vidro translúcido nos cards
- **Animações suaves** — transições fluidas entre telas
- **Dark mode** — suporte a tema escuro
- **Responsivo** — funciona no mobile e no desktop

## Endpoints Principais da API

| Função | Método | Endpoint |
|--------|--------|----------|
| Entrar | POST | `/api/login` |
| Cadastrar | POST | `/api/signup` |
| Ver carteira | GET | `/api/carteira` |
| Ver transações | GET | `/api/transacoes` |
| Ver estratégias | GET | `/api/estrategias` |
| Comprar ativo | POST | `/api/carteira/comprar` |
| Vender ativo | POST | `/api/carteira/vender` |

## Testes

- **Backend**: Jest (testes unitários e de integração)
- **Frontend**: Cypress (testes E2E) + Vitest (testes unitários)

```bash
# Testar backend
npm test

# Testar frontend E2E
npm run test:e2e
```

## Segurança

- Autenticação JWT
- Rate limiting (prevenção de ataques)
- Headers seguros (Helmet)
- Validação de dados (Joi)
- CORS configurado
- Logs de auditoria

## Deploy

- **Backend**: Vercel ou Railway
- **App Android**: Capacitor (build nativo)

## Objetivo do Projeto

O projeto foi desenvolvido para aplicar na prática conhecimentos de **Engenharia de Dados** (ETL, Python, bancos relacionais) e **Análise de Dados**, com um frontend servindo como interface visual de consumo para o ecossistema de dados gerado no backend.