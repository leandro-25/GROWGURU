require('dotenv').config();
const express = require('express');
const cors = require('cors');
const compression = require('compression');

// Importar middlewares
const { errorHandler } = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const { cacheMiddleware, cacheResponse } = require('./middleware/cache');
const { securityMiddleware } = require('./middleware/security');
const metricsMiddleware = require('./middleware/metrics');

// Importar configurações e rotas
const corsConfig = require('./config/corsConfig');
const supabase = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const strategyRoutes = require('./routes/strategyRoutes');
const portfolioRoutes = require('./routes/portfolioRoutes');

const app = express();
const port = process.env.PORT || 3000;

// Não iniciar o servidor em modo teste
const shouldStartServer = process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test';

// Aplicar middlewares de segurança
app.use(...securityMiddleware);

// Aplicar o CORS otimizado
app.use(cors(corsConfig));

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', cors(corsConfig));

// Configuração de CSP para desenvolvimento
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    // Removido os headers CORS redundantes que já são gerenciados pelo middleware cors()
    
    // Configuração de CSP para permitir o DevTools
    const csp = [
      "default-src 'self' 'unsafe-inline' 'unsafe-eval' data: gap: https://ssl.gstatic.com",
      "style-src 'self' 'unsafe-inline'",
      "media-src *",
      "img-src 'self' data: content:",
      "connect-src 'self' ws: wss: http: https:",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "font-src 'self' data:"
    ].join('; ');
    
    res.header('Content-Security-Policy', csp);
  }
  next();
});

app.use(express.json());
app.use(compression());
app.use(metricsMiddleware);

// Rota de health check para testar CORS
app.get('/api/health', cacheMiddleware(60), (req, res) => {
  logger.info('Health check accessed', { origin: req.get('Origin') });
  
  res.json({ 
    status: 'OK',
    message: 'API está funcionando',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    origin: req.get('Origin') || 'No origin'
  });
});

// Rota de teste CORS
app.options('/api/health', cors(corsConfig));

// Usar as rotas
app.use('/api', authRoutes);
app.use('/api', userRoutes);
app.use('/api', transactionRoutes);
app.use('/api', strategyRoutes);
app.use('/api', portfolioRoutes);

// Error handling middleware (deve ser o último)
app.use(errorHandler);

// Iniciar o servidor apenas se não for produção ou teste
if (shouldStartServer) {
  app.listen(port, () => {
    logger.info(`Servidor rodando em http://localhost:${port}`);
  });
}

// Exportar o app para o Vercel
module.exports = app;