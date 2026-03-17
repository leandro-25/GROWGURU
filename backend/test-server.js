const express = require('express');
const cors = require('cors');

const app = express();

// Configuração CORS simplificada
app.use(cors({
  origin: ['http://localhost:8100', 'https://gg-backend-vercel2.vercel.app'],
  credentials: true
}));

app.use(express.json());

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK',
    message: 'API de teste funcionando',
    timestamp: new Date().toISOString(),
    origin: req.get('Origin') || 'No origin'
  });
});

// Exportar para Vercel
module.exports = app;
