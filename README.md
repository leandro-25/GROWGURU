# 🌱 GrowGuru - Seu Guia de Investimentos

<div align="center">
<img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
<img src="https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
<img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white" alt="Supabase">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">
<img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js">
<img src="https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic">
</div>

---

## 🚀 O que é o GrowGuru?

O **GrowGuru** é um aplicativo móvel híbrido para quem quer organizar e acompanhar seus investimentos de forma simples e eficiente. Com ele, você pode:

- 📊 **Ver sua carteira completa** - Tudo que você investiu, separado por estratégia
- 💰 **Registrar compras e vendas** - Acompanhe cada transação
- 📈 **Acompanhar rentabilidade** - Se quanto seus investimentos estão rendendo
- 🎯 **Organizar por estratégias** - Agrupe seus ativos do jeito que preferir

É como ter um guru pessoal te ajudando a fazer seu dinheiro crescer! 🌱

---

## 🧠 Pipeline de ETL, Dados e Inteligência Artificial

O coração do projeto é um pipeline de **ETL (Extração, Transformação e Carga)** construído em Python, que consome dados reais da B3 via Yahoo Finance, trata essas informações com Pandas/NumPy e carrega em um banco relacional PostgreSQL (Supabase).

### 🤖 1. Backtest de Estratégias (`estrategias/`)

Um sistema completo de **simulação histórica** que testa estratégias de investimento usando dados reais do mercado brasileiro:

- **412 ativos** da B3 (ações, FIIs, BDRs)
- **5 anos de dados históricos** (2020-2025)
- **14 estratégias diferentes** testadas:

#### 📊 Resultados das Estratégias (Backtest 5 anos)

| Estratégia | Retorno | Sharpe |
|------------|---------|--------|
| Estratégia Athena | **197.37%** | 1.26 |
| Estratégia Croesus | **192.24%** | 1.16 |
| Estratégia Aurum | **192.24%** | 1.16 |
| Estratégia Lakshmi | **137.25%** | 0.75 |
| Estratégia Plutus | **138.93%** | 0.75 |
| Benchmark IBOV | 50.01% | 0.22 |

> 📈 As estratégias beataram o Ibovespa significativamente!

#### 🔬 Como funciona?

1. Coleta dados de preço e volume do Yahoo Finance
2. Coleta dados fundamentalistas (P/L, ROE, dividend yield, etc.)
3. Aplica analises, filtros e rankings para selecionar os melhores ativos
4. Simula uma carteira com rebalanceamento semanal/mensal
5. Calcula retorno total e índice de Sharpe
6. Salva os resultados no banco de dados (Supabase)

---

### 📰 2. Análise de Notícias com IA (`crerwai/`)

Um **agente de IA** que monitora e analisa notícias sobre os ativos da sua carteira:

- **Integração com LLMs** (Groq/LiteLLM)
- **Análise de sentimento** de notícias
- **Determinação de impacto** (positivo/neutro/negativo)
- **API REST** para consumo pelo app principal

#### 🏗️ Arquitetura

```
Frontend (Ionic/Vue)
       │
       ▼
Backend API (Node/Express)
       │
       ▼
Supabase (Dados + Auth)
       │
       ├──► Backtest Engine (Python/Jupyter)
       │         │
       │         ▼
       │    Análise de Dados
       │    (Pandas, NumPy, TA-Lib)
       │
       └──► Agente de IA (Flask + LLM)
                 │
                 ▼
             Análise de Notícias
             (Groq API)
```

#### 💡 Tecnologias de IA/ML usadas

- **Python** - Linguagem principal para análise
- **Pandas/NumPy** - Manipulação de dados
- **TA-Lib** - Indicadores técnicos (RSI, MACD, SMA)
- **yfinance** - Coleta de dados do mercado
- **LiteLLM** - Interface unificada para LLMs
- **Groq** - API de inferência LLM rápida
- **Flask** - API para análise de notícias
- **Jupyter Notebook** - Backtest interativo

---

### 🎯 O Diferencial do Projeto

O GrowGuru não é apenas um "app de planilha" - ele oferece:

1. **Dados reais do mercado** - 412 ativos brasileiros
2. **Estratégias testadas matematicamente** - Backtest com 5 anos de histórico
3. **Inteligência artificial** - Análise automática de notícias
4. **Atualização automática** - Rankings atualizados periodicamente
5. **Decisões baseadas em dados** - Não é chute, é ciência!

---

## 💻 Tecnologias que usamos

### No Backend (API)
- **Node.js** + **Express** - Para criar a API REST
- **PostgreSQL** (via Supabase) - Modelagem de banco de dados relacional e armazenamento do histórico de ativos
- **Winston** - Para logs e monitoramento
- **Jest** - Testes automatizados

### No Frontend (App)
- **Vue.js 3** com **TypeScript** - Interface reativa e tipada
- **Ionic Framework** - UI mobile-first linda e funcional
- **Pinia** - Gerenciamento de estado
- **Chart.js** - Gráficos informativos
- **TailwindCSS** - Estilização moderna

---

## 🎯 Principais Funcionalidades

### 1. Autenticação 🔐
- Login e cadastro seguro
- Recuperação de senha via email
- Tokens JWT para segurança

### 2. Página Inicial 🏠
- Saldo total investido
- Percentual de rentabilidade
- Transações recentes
- Acesso rápido ao perfil

### 3. Carteira 📦
- Visualização completa do portfólio
- Gráfico de distribuição por estratégia
- Detalhamento de cada ativo
- Porcentagem de cada posição

### 4. Transações 💳
- Registro de compras
- Registro de vendas
- Histórico paginado
- Filtro por tipo

### 5. Estratégias 🎯
- Lista de estratégias cadastradas
- Ativos que compõem cada estratégia
- Rentabilidade média
- Status (aberta/fechada)

---

## 🏗️ Como está organizado?

```
growguru/
├── backend/           # API RESTful
│   ├── controllers/   # Lógica do servidor
│   ├── routes/        # Rotas da API
│   ├── models/        # Acesso ao banco
│   ├── middleware/    # Segurança e utilitários
│   └── tests/        # Testes automatizados
│
├── frontend/          # Aplicativo Ionic
│   ├── src/
│   │   ├── views/     # Páginas do app
│   │   ├── components/# Componentes reutilizáveis
│   │   ├── stores/    # Estado global (Pinia)
│   │   ├── composables/# Lógica reutilizável
│   │   └── router/    # Navegação
│   └── android/       # Config Android (Capacitor)
│
├── estrategias/       # 🔬 Backtest de estratégias (Python/Jupyter)
│   └── tg.ipynb       # Notebook de análise de dados
│
└── crerwai/          # 🤖 Agente de IA para notícias
    ├── app.py        # API Flask
    └── teste_otimizado.py  # Módulo de análise LLM
```

---

## 🖼️ Visualizações

<!-- Adicione aqui prints dos gráficos gerados pelo Python (estrategias/tg.ipynb) -->
<!-- Adicione aqui um diagrama da arquitetura (pode gerar em draw.io) -->
<!-- Adicione aqui 1-2 prints da tela do aplicativo mobile -->

---

## 🎨 Design

O app tem um visual moderno e clean:

- **Glassmorphism** - Efeitos de vidro translúcido nos cards
- **Animações suaves** - Transições fluidas entre telas
- **Dark mode** - Suporte a tema escuro
- **Responsivo** - Funciona no mobile e no desktop

---

## 🔌 API - Endpoints Principais

| O que precisa? | Método | Endpoint |
|---------------|--------|----------|
| Entrar | POST | `/api/login` |
| Cadastrar | POST | `/api/signup` |
| Ver carteira | GET | `/api/carteira` |
| Ver transações | GET | `/api/transacoes` |
| Ver estratégias | GET | `/api/estrategias` |
| Comprar ativo | POST | `/api/carteira/comprar` |
| Vender ativo | POST | `/api/carteira/vender` |

---

## 🧪 Testes

- **Backend**: Jest (testes unitários e de integração)
- **Frontend**: Cypress (testes E2E) + Vitest (testes unitários)

```bash
# Testar backend
npm test

# Testar frontend E2E
npm run test:e2e
```

---

## 🔒 Segurança

- Autenticação JWT
- Rate limiting (previne ataques)
- Headers seguros (Helmet)
- Validação de dados (Joi)
- CORS configurado
- Logs de auditoria

---

## 📱 Deploy

- **Backend**: Vercel ou Railway
- **App Android**: Capacitor (build nativo)

---

## 📌 Por que criamos isso?

Este projeto foi desenvolvido para aplicar na prática conhecimentos de **Engenharia de Dados** (ETL, Python, Bancos Relacionais), **Análise de Dados** e consumo de APIs. O aplicativo Frontend foi construído para servir como interface visual de consumo para todo o ecossistema de dados gerado no backend.



---

<div align="center">

*GrowGuru - Cultivando seus investimentos* 🌱💰

</div>
