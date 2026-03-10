# 🌱 GrowGuru - Seu Guia de Investimentos

<div align="center">

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
<img src="https://img.shields.io/badge/Vue.js-4FC08D?style=for-the-badge&logo=vuedotjs&logoColor=white" alt="Vue.js">
<img src="https://img.shields.io/badge/Ionic-3880FF?style=for-the-badge&logo=ionic&logoColor=white" alt="Ionic">
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js">

</div>

---

## 🚀 O que é o GrowGuru?

O **GrowGuru** é um aplicativo móvel híbrido para quem quer organizar e acompanhar seus investimentos de forma simples e eficiente. Com ele, você pode:

- 📊 **Ver sua carteira completa** - Tudo que você investiu, separado por estratégia
- 💰 **Registrar compras e vendas** - Acompanhe cada transação
- 📈 **Acompanhar rentabilidade** - See quanto seus investimentos estão rendendo
- 🎯 **Organizar por estratégias** - Agrupe seus ativos do jeito que preferir

É como ter um guru pessoal te ajudando a fazer seu dinheiro crescer! 🌱

---

## 💻 Tecnologias que usamos

### No Backend (API)
- **Node.js** + **Express** - Para criar a API REST
- **Supabase** (PostgreSQL) - Banco de dados e autenticação
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
```

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
- **Frontend Web**: Vercel, Netlify
- **App Android**: Capacitor (build nativo)

---

## 📌 Por que criamos isso?

Este projeto foi desenvolvido como parte de um aprendizado prático de tecnologias modernas de desenvolvimento web e mobile. O objetivo era criar uma aplicação completa que demonstrasse:

- Criação de APIs RESTful com Node.js
- Desenvolvimento de apps híbridos com Ionic + Vue
- Integração com banco de dados SQL (Supabase)
- Gerenciamento de estado reativo
- Boas práticas de segurança e performance

---

## 🎉 Contribuindo

Quer contribuir com o projeto? Fique à vontade para fazer um fork e enviar Pull Requests!

---

**Feito com ❤️ e muito ☕**

---

<div align="center">

*GrowGuru - Cultivando seus investimentos* 🌱💰

</div>
