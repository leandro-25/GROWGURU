# API Documentation

## Overview
API RESTful para aplicação GrowGuru com autenticação, gerenciamento de usuários e portfólio.

## Base URL
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.vercel.app/api`

## Autenticação
A API usa JWT tokens via Supabase Auth. Incluir token no header:
```
Authorization: Bearer <token>
```

## Rate Limiting
- **Auth endpoints**: 5 tentativas por IP a cada 15 minutos
- **API geral**: 100 requests por IP a cada 15 minutos
- **Operações sensíveis** (compra/venda): 10 por hora
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`

---

## Endpoints

### Auth

#### POST /api/login
Login de usuário.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "user": { "id": "123", "email": "user@example.com" },
  "session": { "access_token": "abc123", "refresh_token": "..." }
}
```

**Response (401):**
```json
{
  "code": "AUTH_FAILED",
  "message": "E-mail ou senha incorretos"
}
```

---

#### POST /api/signup
Cadastro de novo usuário.

**Body:**
```json
{
  "nome": "João Silva",
  "email": "joao@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "user": { "id": "...", "email": "...", "profile": {...} }
}
```

---

#### POST /api/forgot-password
Solicitação de recuperação de senha.

**Body:**
```json
{
  "email": "user@example.com"
}
```

**Response (200):**
```json
{ "message": "E-mail de recuperação enviado com sucesso!" }
```

---

#### POST /api/reset-password
Redefinição de senha com token.

**Body:**
```json
{
  "token": "reset-token",
  "password": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response (200):**
```json
{ "message": "Senha redefinida com sucesso!" }
```

---

### Usuário

#### GET /api/usuarios
Busca dados do usuário autenticado.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "id": 1,
  "nome": "João Silva",
  "email": "joao@example.com",
  "saldo": 1000.00,
  "user_id": "supabase-user-id"
}
```

---

#### PUT /api/profile
Atualiza perfil do usuário.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "nome": "João Atualizado"
}
```

**Response (200):**
```json
{ "message": "Perfil atualizado com sucesso" }
```

---

### Portfólio

#### GET /api/carteira
Lista todos os investimentos do usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Dividendos",
    "total_investido": 5000.00,
    "porcentagem": 50.00,
    "ativos": [
      {
        "codigo": "PETR4",
        "quantidade": 100,
        "valor_medio": 50.00,
        "preco_atual": 55.00,
        "valor_total": 5000.00
      }
    ]
  }
]
```

---

#### POST /api/carteira
Registra compra de ativo.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "codigo_ativo": "PETR4",
  "quantidade": 10,
  "valor_compra": 50.00,
  "estrategia_id": 1
}
```

**Response (200):**
```json
{
  "message": "Compra registrada com sucesso",
  "data": { "novo_saldo": 9500.00 }
}
```

**Validation Errors (400):**
```json
{
  "code": "VALIDATION_ERROR",
  "message": "Dados inválidos",
  "errors": [
    { "field": "codigo_ativo", "message": "\"codigo_ativo\" must be a string" }
  ]
}
```

---

#### POST /api/vender
Registra venda de ativo.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "codigo_ativo": "PETR4",
  "quantidade": 5,
  "estrategia_id": 1,
  "preco_venda": 55.00
}
```

**Response (200):**
```json
{
  "message": "Venda realizada com sucesso",
  "data": { "novo_saldo": 10275.00 }
}
```

---

#### GET /api/total-investido
Retorna total investido pelo usuário.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "total_investido": 10000.00
}
```

---

### Transações

#### GET /api/transacoes
Lista transações do usuário com paginação.

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `page` (opcional): Página atual (default: 1)
- `limit` (opcional): Itens por página (default: 20, max: 100)
- `tipo` (opcional): Filtrar por tipo - "compra" ou "venda"

**Response (200):**
```json
[
  {
    "id": 1,
    "tipo": "compra",
    "valor": -500.00,
    "descricao": "10 cota de PETR4",
    "data": "2024-01-15T10:30:00Z",
    "codigo_ativo": "PETR4",
    "quantidade": 10,
    "valor_unitario": 50.00,
    "valor_total": 500.00
  },
  {
    "id": 2,
    "tipo": "venda",
    "valor": 275.00,
    "descricao": "5 cota de PETR4",
    "data": "2024-01-20T14:00:00Z",
    "codigo_ativo": "PETR4",
    "quantidade": -5,
    "valor_unitario": 55.00,
    "valor_total": 275.00
  }
]
```

---

#### POST /api/transacoes
Registra transação manual.

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "valor": 100.00,
  "tipo": "deposito",
  "descricao": "Depósito inicial"
}
```

---

### Estratégias

#### GET /api/estrategias
Lista todas as estratégias de investimento.

**Response (200):**
```json
[
  {
    "id": 1,
    "nome": "Dividendos",
    "descricao": "Estratégia focada em ações que pagam dividendos",
    "total_ativos": 10,
    "ativos": [...]
  }
]
```

---

#### GET /api/estrategias/:id/ativos
Lista ativos de uma estratégia específica.

**Response (200):**
```json
[
  {
    "id": 1,
    "codigo_ativo": "PETR4",
    "posicao": 1,
    "rentabilidade": 15.5,
    "ativo": {
      "nome": "Petrobras PN",
      "tipo": "ação",
      "preco_atual": 55.00
    }
  }
]
```

---

### Health Check

#### GET /api/health
Verifica status da API.

**Cache:** 60 segundos

**Response (200):**
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "environment": "production"
}
```

---

## Error Handling

### Formato de Erro
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Descrição do erro"
  }
}
```

### Códigos Comuns
| Código | Descrição |
|--------|-----------|
| VALIDATION_ERROR | Dados inválidos |
| AUTH_FAILED | Credenciais incorretas |
| AUTH_RATE_LIMIT | Muitas tentativas de login |
| UNAUTHORIZED | Token inválido ou expirado |
| NOT_FOUND | Recurso não encontrado |
| CONFLICT | Conflito (ex: email já existe) |
| RATE_LIMIT_EXCEEDED | Limite de requisições excedido |
| INTERNAL_ERROR | Erro interno do servidor |

---

## Security

### Headers de Segurança
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security` (HSTS)

### CORS
Origens permitidas por ambiente:
- **Dev**: localhost ports, capacitor
- **Prod**: domínios vercel.app, up.railway.app

### Input Sanitization
- Todos os inputs são sanitizados antes da validação
- Remoção de tags HTML
- Normalização Unicode (NFC)

---

## Performance

### Cache
| Tipo de Dado | TTL |
|--------------|-----|
| Health Check | 60s |
| User Data | 60s |
| Portfolio | 120s |
| Strategies | 300s |
| Transactions | 30s |

### Metrics
- Tempo de resposta monitorado
- Logs estruturados com contexto

---

## Development

### Scripts
```bash
npm run dev          # Development com nodemon
npm test             # Suite de testes
npm run test:watch   # Testes em modo watch
npm run test:coverage # Coverage report
```

### Environment Variables
```
NODE_ENV=development
PORT=3000
SUPABASE_URL=your-url
SUPABASE_ANON_KEY=your-key
LOG_LEVEL=info
```

---

## Testing

### Testes Automatizados
- **Unit tests**: Controllers e middleware
- **Integration tests**: Endpoints completos

### Como Executar
```bash
npm test                    # Todos os testes
npm run test:watch         # Modo watch
npm run test:coverage      # Com coverage
```
